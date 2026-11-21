package com.ecommerce.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchPage {
    private String sessionId;
    private int page;
    private int pageSize;
    private int totalPages;
    private long totalItems;
    private List<ItemView> items;
}
