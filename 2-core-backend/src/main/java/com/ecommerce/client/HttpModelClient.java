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
            List<CompletableFuture<ModelBatch>> futures = items.stream()
                    .map(item -> CompletableFuture.supplyAsync(() -> {
                        ModelRequest req = buildModelRequest(userId, personaId, preferredCategory, item, historyMap);
                        return restClient.post()
                                .uri("/predict")
                                .contentType(MediaType.APPLICATION_JSON)
                                .body(req)
                                .retrieve()
                                .body(ModelBatch.class);
                    }, modelExecutor))
                    .toList();

            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .get(appProperties.getModel().getTimeoutSeconds(), TimeUnit.SECONDS);

            Map<Long, ModelBatch> predictions = new HashMap<>();
            for (CompletableFuture<ModelBatch> f : futures) {
                ModelBatch b = f.join();
                if (b != null) {
                    predictions.put(b.getItemId(), b);
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
            log.warn("HttpModelClient call failed ({}). Falling back to heuristic model...", e.getMessage());
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
