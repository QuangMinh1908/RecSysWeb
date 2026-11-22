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

        // Bước 1: Query DB lấy items & snapshots history
        long t0 = System.currentTimeMillis();
        List<ItemView> rawItems = itemQueryRepository.findItemsByKeywordAndDate(keyword, date);
        if (rawItems.isEmpty()) {
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        List<ItemView> baselineItems = itemQueryRepository.findBaselineItemsByKeywordAndDate(keyword, date);
        List<Long> itemIds = rawItems.stream().map(ItemView::getItemId).toList();
        Map<Long, List<ModelRequest.ProductSnapshot>> history = itemQueryRepository.findSnapshotsHistory(itemIds, date);
        long dbDuration = System.currentTimeMillis() - t0;

        // Bước 2: AI Model M4_GRU suy luận
        int userId = request.getUserId() != null ? request.getUserId() : 1;
        int personaId = request.getPersonaId() != null ? request.getPersonaId() : 0;
        
        long t1 = System.currentTimeMillis();
        List<ItemView> modelOutputItems = modelClient.rankItems(userId, personaId, keyword, rawItems, history);
        long modelDuration = System.currentTimeMillis() - t1;

        // Bước 3: Sắp xếp lại (Rerank) trên bộ nhớ RAM
        long t2 = System.currentTimeMillis();
        List<ItemView> rankedItems = new ArrayList<>(modelOutputItems);
        rankedItems.sort((a, b) -> {
            double pA = a.getPClick() != null ? a.getPClick() : 0.0;
            double pB = b.getPClick() != null ? b.getPClick() : 0.0;
            return Double.compare(pB, pA);
        });

        for (int i = 0; i < rankedItems.size(); i++) {
            rankedItems.get(i).setRank(i + 1);
        }
        long rerankDuration = System.currentTimeMillis() - t2;

        // Bước 4: Lưu vào bộ nhớ đệm RAM SessionStore
        long t3 = System.currentTimeMillis();
        String sessionId = UUID.randomUUID().toString();
        querySessionStore.save(sessionId, rankedItems, baselineItems);
        long cacheDuration = System.currentTimeMillis() - t3;
        long totalDuration = System.currentTimeMillis() - tStart;

        int page = request.getPage() != null ? request.getPage() : 1;
        int pageSize = appProperties.getSearch().getPageSize();
        SearchPage result = pageAssembler.assemble(sessionId, rankedItems, baselineItems, page, pageSize);

        // Ghi log chi tiết: Cả hành động THỰC HIỆN và hành động BỎ QUA (không hoạt động)
        StringBuilder sb = new StringBuilder();
        String nowStr = LocalDateTime.now().format(LOG_DATE_FMT);
        sb.append(String.format("[%s] ====================================================================================================%n", nowStr));
        sb.append(String.format("[%s] [YÊU CẦU TÌM KIẾM] POST /search | Ngành hàng: %s | Ngày: %s | Persona: %d | User: %d%n", nowStr, keyword, date, personaId, userId));
        sb.append(String.format("[%s] ----------------------------------------------------------------------------------------------------%n", nowStr));
        sb.append(String.format("[%s] [HÀNH ĐỘNG THỰC HIỆN] (1/4) DB_FETCH_ITEMS_HISTORY   : %4d ms | Đọc %d SP và toàn bộ chuỗi snapshot giá từ PostgreSQL%n", nowStr, dbDuration, rawItems.size()));
        sb.append(String.format("[%s] [HÀNH ĐỘNG THỰC HIỆN] (2/4) AI_MODEL_M4_GRU_INFERENCE: %4d ms | Chạy forward pass mạng PyTorch M4_GRU chấm điểm CTR p_click%n", nowStr, modelDuration));
        sb.append(String.format("[%s] [HÀNH ĐỘNG THỰC HIỆN] (3/4) IN_MEMORY_RERANK         : %4d ms | Sắp xếp danh sách giảm dần theo điểm P(Click) trên RAM%n", nowStr, rerankDuration));
        sb.append(String.format("[%s] [HÀNH ĐỘNG THỰC HIỆN] (4/4) SESSION_RAM_CACHE_SAVE   : %4d ms | Lưu %d SP đã xếp hạng vào RAM Cache (SessionId: %s)%n", nowStr, cacheDuration, rankedItems.size(), sessionId.substring(0, 8)));
        sb.append(String.format("[%s] ----------------------------------------------------------------------------------------------------%n", nowStr));
        sb.append(String.format("[%s] [HÀNH ĐỘNG BỎ QUA]    (-) DB_REQUERY_ITEM_DETAILS    :    0 ms | [KHÔNG HOẠT ĐỘNG] Dữ liệu SP và ảnh đã có sẵn trong RAM từ Bước 1, KHÔNG query lại DB%n", nowStr));
        sb.append(String.format("[%s] [HÀNH ĐỘNG BỎ QUA]    (-) BACKEND_IMAGE_PROCESSING   :    0 ms | [KHÔNG HOẠT ĐỘNG] Backend không stream ảnh qua API tìm kiếm, chỉ trả URL text cho Browser%n", nowStr));
        sb.append(String.format("[%s] [HÀNH ĐỘNG BỎ QUA]    (-) DATABASE_WRITE_LOCK        :    0 ms | [KHÔNG HOẠT ĐỘNG] Luồng tìm kiếm Read-Only 100%%, không ghi đĩa hay lock bảng%n", nowStr));
        sb.append(String.format("[%s] ----------------------------------------------------------------------------------------------------%n", nowStr));
        sb.append(String.format("[%s] [TỔNG KẾT ĐỘ TRỄ]      TOTAL_SEARCH_TIME              : %4d ms | Trả về %d SP (Trang 1, kích thước %d/trang) ra Frontend%n", nowStr, totalDuration, Math.min(pageSize, rankedItems.size()), pageSize));
        sb.append(String.format("[%s] ====================================================================================================%n", nowStr));

        writeActivityLog(sb.toString());

        return result;
    }

    public SearchPage getPage(String sessionId, int page) {
        long tStart = System.currentTimeMillis();
        QuerySessionStore.CachedSession session = querySessionStore.getSession(sessionId);
        if (session == null || session.items() == null) {
            throw new IllegalArgumentException("Session not found or expired. Please search again.");
        }
        SearchPage result = pageAssembler.assemble(sessionId, session.items(), session.randomItems(), page, appProperties.getSearch().getPageSize());
        long pageDuration = System.currentTimeMillis() - tStart;
        
        StringBuilder sb = new StringBuilder();
        String nowStr = LocalDateTime.now().format(LOG_DATE_FMT);
        sb.append(String.format("[%s] ====================================================================================================%n", nowStr));
        sb.append(String.format("[%s] [YÊU CẦU CHUYỂN TRANG] GET /search?sessionId=%s...&page=%d%n", nowStr, sessionId.substring(0, 8), page));
        sb.append(String.format("[%s] ----------------------------------------------------------------------------------------------------%n", nowStr));
        sb.append(String.format("[%s] [HÀNH ĐỘNG THỰC HIỆN] (1/1) RAM_SESSION_CACHE_SLICE  : %4d ms | Cắt lát 20 sản phẩm tiếp theo từ RAM SessionStore%n", nowStr, pageDuration));
        sb.append(String.format("[%s] [HÀNH ĐỘNG BỎ QUA]    (-) AI_MODEL_RE_INFERENCE      :    0 ms | [KHÔNG HOẠT ĐỘNG] Không gọi lại Model AI (sử dụng điểm CTR đã tính sẵn)%n", nowStr));
        sb.append(String.format("[%s] [HÀNH ĐỘNG BỎ QUA]    (-) DATABASE_RE_QUERY          :    0 ms | [KHÔNG HOẠT ĐỘNG] Không gọi lại Database PostgreSQL%n", nowStr));
        sb.append(String.format("[%s] ----------------------------------------------------------------------------------------------------%n", nowStr));
        sb.append(String.format("[%s] [TỔNG KẾT ĐỘ TRỄ]      PAGE_NAVIGATION_TIME           : %4d ms | Phục vụ tức thì từ RAM Cache ra Frontend%n", nowStr, pageDuration));
        sb.append(String.format("[%s] ====================================================================================================%n", nowStr));

        writeActivityLog(sb.toString());

        return result;
    }

    private void writeActivityLog(String formattedLog) {
        try {
            if (!Files.exists(SERVICE_LOG_PATH.getParent())) {
                Files.createDirectories(SERVICE_LOG_PATH.getParent());
            }
            Files.writeString(SERVICE_LOG_PATH, formattedLog, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) {
            log.warn("Cannot append to service/activity.log: {}", e.getMessage());
        }
    }
}
