package com.ecommerce.service;

import com.ecommerce.client.ModelClient;
import com.ecommerce.config.AppProperties;
import com.ecommerce.model.dto.*;
import com.ecommerce.repository.ItemQueryRepository;
import com.ecommerce.repository.MetaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

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

    public SearchPage search(SearchRequest request) {
        String keyword = request.getKeywordId();
        String date = request.getDate();
        if (date == null || date.isBlank() || "latest".equalsIgnoreCase(date)) {
            date = metaRepository.findLatestDate(keyword);
        }
        if (date == null) {
            log.warn("No data found for keyword {}", keyword);
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        List<ItemView> rawItems = itemQueryRepository.findItemsByKeywordAndDate(keyword, date);
        if (rawItems.isEmpty()) {
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        // 1. Lấy dữ liệu đối chứng trực tiếp từ DB theo thứ tự cố định (ORDER BY item_id ASC, không random)
        List<ItemView> baselineItems = itemQueryRepository.findBaselineItemsByKeywordAndDate(keyword, date, 8);

        // 2. Query snapshots history cho tất cả item
        List<Long> itemIds = rawItems.stream().map(ItemView::getItemId).toList();
        Map<Long, List<ModelRequest.ProductSnapshot>> history = itemQueryRepository.findSnapshotsHistory(itemIds, date);

        // 3. Gửi sang Model Service để nhận dự đoán (CTR p_click, volatility, decision)
        int userId = request.getUserId() != null ? request.getUserId() : 1;
        int personaId = request.getPersonaId() != null ? request.getPersonaId() : 0;
        List<ItemView> modelOutputItems = modelClient.rankItems(userId, personaId, keyword, rawItems, history);

        // 4. Backend sắp xếp lại item dựa vào output đó theo chuẩn hệ thống khuyến nghị:
        // Sắp xếp giảm dần theo điểm p_click (xác suất click cao hơn đứng trước)
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

        // 5. Lưu vào cache session (cả danh sách đã khuyến nghị và baseline DB cố định)
        String sessionId = UUID.randomUUID().toString();
        querySessionStore.save(sessionId, rankedItems, baselineItems);

        // 6. Phân trang 20 sản phẩm/trang và trả về
        int page = request.getPage() != null ? request.getPage() : 1;
        return pageAssembler.assemble(sessionId, rankedItems, baselineItems, page, appProperties.getSearch().getPageSize());
    }

    public SearchPage getPage(String sessionId, int page) {
        QuerySessionStore.CachedSession session = querySessionStore.getSession(sessionId);
        if (session == null || session.items() == null) {
            throw new IllegalArgumentException("Session not found or expired. Please search again.");
        }
        return pageAssembler.assemble(sessionId, session.items(), session.randomItems(), page, appProperties.getSearch().getPageSize());
    }
}
