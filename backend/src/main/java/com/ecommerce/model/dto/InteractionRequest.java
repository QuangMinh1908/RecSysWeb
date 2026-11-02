package com.ecommerce.model.dto;

import com.ecommerce.model.entity.InteractionType;
import jakarta.validation.constraints.NotNull;

/** Body của POST /api/v1/interactions. */
public record InteractionRequest(
        @NotNull Long userId,
        @NotNull Long productId,
        @NotNull InteractionType type
) {
}
