package com.ecommerce.service;

import com.ecommerce.model.dto.ItemView;
import com.ecommerce.model.dto.SearchPage;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class PageAssembler {

    public SearchPage assemble(String sessionId, List<ItemView> allItems, List<ItemView> baselineItems, int page, int pageSize) {
        List<ItemView> safeBaseline = baselineItems != null ? baselineItems : Collections.emptyList();
        if (allItems == null || allItems.isEmpty()) {
            return SearchPage.builder()
                    .sessionId(sessionId)
                    .page(page)
                    .pageSize(pageSize)
                    .totalPages(0)
                    .totalItems(0)
                    .items(Collections.emptyList())
                    .randomItems(safeBaseline)
                    .baselineItems(safeBaseline)
                    .build();
        }

        int totalItems = allItems.size();
        int totalPages = (int) Math.ceil((double) totalItems / pageSize);

        int safePage = Math.max(1, Math.min(page, totalPages));
        int fromIndex = (safePage - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, totalItems);

        List<ItemView> slice = fromIndex < totalItems ? allItems.subList(fromIndex, toIndex) : Collections.emptyList();

        return SearchPage.builder()
                .sessionId(sessionId)
                .page(safePage)
                .pageSize(pageSize)
                .totalPages(totalPages)
                .totalItems(totalItems)
                .items(slice)
                .randomItems(safeBaseline)
                .baselineItems(safeBaseline)
                .build();
    }
}
