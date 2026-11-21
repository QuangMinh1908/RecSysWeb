package com.ecommerce.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemView {
    private Long itemId;
    private String name;
    private String category;
    private Long brandId;
    private Long sellerId;
    private Double originalPrice;
    private Double currentPrice;
    private Double discountRate;
    private Double ratingAverage;
    private Integer reviewCount;
    private Double soldCount;
    private String shopName;
    private String imageUrl;
    private Integer rank;
    private Double pClick;
    private String decision;
    private String priceVolatilityTier;
}
