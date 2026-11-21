package com.ecommerce.service;

import com.ecommerce.client.ModelClient;
import com.ecommerce.config.AppProperties;
import com.ecommerce.model.dto.*;
import com.ecommerce.repository.ItemQueryRepository;
import com.ecommerce.repository.MetaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        List<ItemView> rawItems = itemQueryRepository.findItemsByKeywordAndDate(keyword, date);
        if (rawItems.isEmpty()) {
            return pageAssembler.assemble(UUID.randomUUID().toString(), List.of(), 1, appProperties.getSearch().getPageSize());
        }

        List<Long> itemIds = rawItems.stream().map(ItemView::getItemId).toList();
        Map<Long, List<ModelRequest.ProductSnapshot>> history = itemQueryRepository.findSnapshotsHistory(itemIds, date);

        int userId = request.getUserId() != null ? request.getUserId() : 1;
        int personaId = request.getPersonaId() != null ? request.getPersonaId() : 0;
        List<ItemView> rankedItems = modelClient.rankItems(userId, personaId, keyword, rawItems, history);

        String sessionId = UUID.randomUUID().toString();
        querySessionStore.save(sessionId, rankedItems);

        int page = request.getPage() != null ? request.getPage() : 1;
        return pageAssembler.assemble(sessionId, rankedItems, page, appProperties.getSearch().getPageSize());
    }

    public SearchPage getPage(String sessionId, int page) {
        List<ItemView> cached = querySessionStore.get(sessionId);
        if (cached == null) {
            throw new IllegalArgumentException("Session not found or expired. Please search again.");
        }
        return pageAssembler.assemble(sessionId, cached, page, appProperties.getSearch().getPageSize());
    }
}
