package com.ecommerce.service;

import com.ecommerce.client.ModelClient;
import com.ecommerce.config.AppProperties;
import com.ecommerce.model.dto.*;
import com.ecommerce.repository.ItemQueryRepository;
import com.ecommerce.repository.MetaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final ItemQueryRepository itemQueryRepository;
    private final MetaRepository metaRepository;
    private final ModelClient modelClient;
    private final QuerySessionStore querySessionStore;
    private final PageAssembler pageAssembler;
    private final AppProperties appProperties;

    private static final DateTimeFormatter LOG_DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final Path SERVICE_LOG_PATH = Paths.get("/home/ds300/Demo-Web/service/activity.log");

    public SearchPage search(SearchRequest request) {
        long tStart = System.currentTimeMillis();
        String keyword = request.getKeywordId();
        String date = request.getDate();
        if (date == null || date.isBlank() || "latest".equalsIgnoreCase(date)) {
            date = metaRepository.findLatestDate(keyword);
        }
        if (date == null) {
            log.warn("No data found for keyword {}", keyword);
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        long t0 = System.currentTimeMillis();
        List<ItemView> rawItems = itemQueryRepository.findItemsByKeywordAndDate(keyword, date);
        if (rawItems.isEmpty()) {
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        // 1. Lấy TOÀN BỘ dữ liệu đối chứng trực tiếp từ DB theo thứ tự cố định (ORDER BY item_id ASC, không giới hạn)
        List<ItemView> baselineItems = itemQueryRepository.findBaselineItemsByKeywordAndDate(keyword, date);

        // 2. Query snapshots history cho tất cả item
        List<Long> itemIds = rawItems.stream().map(ItemView::getItemId).toList();
        Map<Long, List<ModelRequest.ProductSnapshot>> history = itemQueryRepository.findSnapshotsHistory(itemIds, date);
        long dbDuration = System.currentTimeMillis() - t0;

        // 3. Gửi sang Model Service để nhận dự đoán (CTR p_click, volatility, decision)
        int userId = request.getUserId() != null ? request.getUserId() : 1;
        int personaId = request.getPersonaId() != null ? request.getPersonaId() : 0;
        
        long t1 = System.currentTimeMillis();
        List<ItemView> modelOutputItems = modelClient.rankItems(userId, personaId, keyword, rawItems, history);
        long modelDuration = System.currentTimeMillis() - t1;

        // 4. Backend sắp xếp lại item dựa vào output đó theo chuẩn hệ thống khuyến nghị:
        // Sắp xếp giảm dần theo điểm p_click (xác suất click cao hơn đứng trước)
        long t2 = System.currentTimeMillis();
        List<ItemView> rankedItems = new ArrayList<>(modelOutputItems);
        rankedItems.sort((a, b) -> {
            double pA = a.getPClick() != null ? a.getPClick() : 0.0;
            double pB = b.getPClick() != null ? b.getPClick() : 0.0;
            return Double.compare(pB, pA);
        });

        // Đánh lại Rank #1, #2, #3... tuần tự theo thứ hạng mới đã sắp xếp
        for (int i = 0; i < rankedItems.size(); i++) {
            rankedItems.get(i).setRank(i + 1);
        }

        // 5. Lưu vào cache session (cả danh sách đã khuyến nghị và toàn bộ baseline DB)
        String sessionId = UUID.randomUUID().toString();
        querySessionStore.save(sessionId, rankedItems, baselineItems);
        long rerankDuration = System.currentTimeMillis() - t2;
        long totalDuration = System.currentTimeMillis() - tStart;

        // Ghi log thời gian hoạt động chi tiết
        String logMsg = String.format("SEARCH_RECOMMENDATION | Keyword: %-18s | Date: %s | Persona: %d | Items: %3d | DB: %3dms | AI_Model: %4dms | Rerank: %2dms | Total: %4dms",
                keyword, date, personaId, rankedItems.size(), dbDuration, modelDuration, rerankDuration, totalDuration);
        writeActivityLog(logMsg);

        // 6. Phân trang 20 sản phẩm/trang và trả về
        int page = request.getPage() != null ? request.getPage() : 1;
        return pageAssembler.assemble(sessionId, rankedItems, baselineItems, page, appProperties.getSearch().getPageSize());
    }

    public SearchPage getPage(String sessionId, int page) {
        long tStart = System.currentTimeMillis();
        QuerySessionStore.CachedSession session = querySessionStore.getSession(sessionId);
        if (session == null || session.items() == null) {
            throw new IllegalArgumentException("Session not found or expired. Please search again.");
        }
        SearchPage result = pageAssembler.assemble(sessionId, session.items(), session.randomItems(), page, appProperties.getSearch().getPageSize());
        long pageDuration = System.currentTimeMillis() - tStart;
        
        String logMsg = String.format("PAGE_NAV_CACHE_HIT   | SessionId: %s | Page: %d | Total: %dms (Serving from RAM cache)",
                sessionId, page, pageDuration);
        writeActivityLog(logMsg);

        return result;
    }

    private void writeActivityLog(String message) {
        log.info(message);
        try {
            String timestamp = LocalDateTime.now().format(LOG_DATE_FMT);
            String line = String.format("[%s] [BACKEND] %s%n", timestamp, message);
            if (!Files.exists(SERVICE_LOG_PATH.getParent())) {
                Files.createDirectories(SERVICE_LOG_PATH.getParent());
            }
            Files.writeString(SERVICE_LOG_PATH, line, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) {
            log.warn("Cannot append to service/activity.log: {}", e.getMessage());
        }
    }
}
