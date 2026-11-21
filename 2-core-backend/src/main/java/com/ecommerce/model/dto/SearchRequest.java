package com.ecommerce.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    private Integer userId;
    private Integer personaId;
    @NotBlank
    private String keywordId;
    private String date;
    private Integer page;
}
