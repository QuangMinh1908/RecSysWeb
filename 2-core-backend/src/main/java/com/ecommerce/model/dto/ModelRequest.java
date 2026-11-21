package com.ecommerce.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelRequest {
    private UserProfile user;
    @JsonProperty("product_static")
    private ProductStaticInfo productStatic;
    @JsonProperty("snapshots_history")
    private List<ProductSnapshot> snapshotsHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserProfile {
        @JsonProperty("user_id")
        private int userId;
        @JsonProperty("persona_id")
        private int personaId;
        @JsonProperty("preferred_category")
        private String preferredCategory;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductStaticInfo {
        @JsonProperty("item_id")
        private long itemId;
        private String name;
        private String category;
        @JsonProperty("brand_id")
        private int brandId;
        @JsonProperty("seller_id")
        private int sellerId;
        @JsonProperty("original_price")
        private double originalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductSnapshot {
        @JsonProperty("snapshot_date")
        private String snapshotDate;
        private double price;
        @JsonProperty("discount_rate")
        private double discountRate;
        @JsonProperty("rating_average")
        private double ratingAverage;
        @JsonProperty("review_count")
        private int reviewCount;
        @JsonProperty("sold_count")
        private double soldCount;
    }
}
