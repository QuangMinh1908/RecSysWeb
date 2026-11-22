package com.ecommerce.client;

import com.ecommerce.config.AppProperties;
import com.ecommerce.model.dto.ItemView;
import com.ecommerce.model.dto.ModelBatch;
import com.ecommerce.model.dto.ModelRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
@Primary
public class HttpModelClient implements ModelClient {

    private final AppProperties appProperties;
    private final ExecutorService modelExecutor;
    private final FallbackModelClient fallbackModelClient;
    private final RestClient restClient;

    public HttpModelClient(
            AppProperties appProperties,
            @Qualifier("modelExecutor") ExecutorService modelExecutor,
            FallbackModelClient fallbackModelClient
    ) {
        this.appProperties = appProperties;
        this.modelExecutor = modelExecutor;
        this.fallbackModelClient = fallbackModelClient;
        this.restClient = RestClient.builder()
                .baseUrl(appProperties.getModel().getUrl())
                .build();
    }

    @Override
    public List<ItemView> rankItems(
            int userId,
            int personaId,
            String preferredCategory,
            List<ItemView> items,
            Map<Long, List<ModelRequest.ProductSnapshot>> historyMap
    ) {
        if (items == null || items.isEmpty()) {
            return Collections.emptyList();
        }

        try {
            // [GIẢI PHÁP 1: BATCH API]
            // Gom toàn bộ N sản phẩm vào một danh sách duy nhất để gửi trong 1 HTTP POST duy nhất tới /predict_batch
            // Thay vì mở N kết nối HTTP song song làm tắc nghẽn GIL và Uvicorn
            CompletableFuture<ModelBatch[]> future = CompletableFuture.supplyAsync(() -> {
                List<ModelRequest> batchRequests = items.stream()
                        .map(item -> buildModelRequest(userId, personaId, preferredCategory, item, historyMap))
                        .toList();

                return restClient.post()
                        .uri("/predict_batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(batchRequests)
                        .retrieve()
                        .body(ModelBatch[].class);
            }, modelExecutor);

            ModelBatch[] responses = future.get(appProperties.getModel().getTimeoutSeconds(), TimeUnit.SECONDS);

            Map<Long, ModelBatch> predictions = new HashMap<>();
            if (responses != null) {
                for (ModelBatch b : responses) {
                    if (b != null) {
                        predictions.put(b.getItemId(), b);
                    }
                }
            }

            List<ItemView> ranked = new ArrayList<>(items);
            for (ItemView item : ranked) {
                ModelBatch b = predictions.get(item.getItemId());
                if (b != null) {
                    item.setPClick(b.getPClick());
                    item.setDecision(b.getDecision());
                    item.setPriceVolatilityTier(b.getPriceVolatilityTier());
                } else {
                    item.setPClick(0.0);
                    item.setDecision("PASS");
                    item.setPriceVolatilityTier("Low");
                }
            }

            ranked.sort((a, b) -> Double.compare(
                    b.getPClick() != null ? b.getPClick() : 0.0,
                    a.getPClick() != null ? a.getPClick() : 0.0
            ));

            for (int i = 0; i < ranked.size(); i++) {
                ranked.get(i).setRank(i + 1);
            }

            return ranked;

        } catch (Exception e) {
            log.warn("HttpModelClient call failed ({}). Falling back to heuristic model...", e.getMessage(), e);
            return fallbackModelClient.rankItems(userId, personaId, preferredCategory, items, historyMap);
        }
    }

    private ModelRequest buildModelRequest(
            int userId,
            int personaId,
            String preferredCategory,
            ItemView item,
            Map<Long, List<ModelRequest.ProductSnapshot>> historyMap
    ) {
        ModelRequest.UserProfile user = ModelRequest.UserProfile.builder()
                .userId(userId)
                .personaId(personaId)
                .preferredCategory(preferredCategory)
                .build();

        ModelRequest.ProductStaticInfo staticInfo = ModelRequest.ProductStaticInfo.builder()
                .itemId(item.getItemId())
                .name(item.getName() != null ? item.getName() : "Shopee Product")
                .category(item.getCategory() != null ? item.getCategory() : preferredCategory)
                .brandId(item.getBrandId() != null ? item.getBrandId().intValue() : 0)
                .sellerId(item.getSellerId() != null ? item.getSellerId().intValue() : 0)
                .originalPrice(item.getOriginalPrice() != null ? item.getOriginalPrice() : 0.0)
                .build();

        List<ModelRequest.ProductSnapshot> snaps = historyMap.getOrDefault(item.getItemId(), Collections.emptyList());

        return ModelRequest.builder()
                .user(user)
                .productStatic(staticInfo)
                .snapshotsHistory(snaps)
                .build();
    }
}
