package com.ecommerce.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelBatch {
    @JsonProperty("item_id")
    private long itemId;
    @JsonProperty("p_click")
    private double pClick;
    private String decision;
    private double threshold;
    @JsonProperty("model_version")
    private String modelVersion;
    @JsonProperty("num_snapshots_used")
    private int numSnapshotsUsed;
    @JsonProperty("price_volatility_tier")
    private String priceVolatilityTier;
    @JsonProperty("temporal_signals")
    private Map<String, Object> temporalSignals;
}
