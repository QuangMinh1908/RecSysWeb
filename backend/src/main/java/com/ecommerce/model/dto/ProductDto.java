package com.ecommerce.model.dto;

import com.ecommerce.model.entity.Product;

import java.math.BigDecimal;

/** Dữ liệu sản phẩm trả về cho Frontend. */
public record ProductDto(
        Long id,
        String name,
        BigDecimal price,
        BigDecimal originalPrice,
        String imageUrl,
        String description
) {
    public static ProductDto from(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getPrice(),
                p.getOriginalPrice(),
                p.getImageUrl(),
                p.getDescription()
        );
    }
}
