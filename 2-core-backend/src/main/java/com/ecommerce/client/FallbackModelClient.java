package com.ecommerce.client;

import com.ecommerce.model.dto.ItemView;
import com.ecommerce.model.dto.ModelRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class FallbackModelClient implements ModelClient {

    @Override
    public List<ItemView> rankItems(
            int userId,
            int personaId,
            String preferredCategory,
            List<ItemView> items,
            Map<Long, List<ModelRequest.ProductSnapshot>> historyMap
    ) {
        List<ItemView> sorted = new ArrayList<>(items);

        // Persona-driven heuristic scoring:
        // Persona 0: Deal Hunter -> Ưu tiên giảm giá cao nhất (discount_rate)
        // Persona 1: Trend Chaser -> Ưu tiên lượt bán chạy nhất (sold_count)
        // Persona 2: Quality Seeker -> Ưu tiên đánh giá cao nhất (rating_average & review_count)
        // Persona 3: Frugal -> Ưu tiên giá thấp nhất (current_price)
        // Persona 4: Brand Loyalist -> Ưu tiên shop chính hãng (shop_name / brand)
        sorted.sort((a, b) -> {
            double scoreA = calculatePersonaScore(a, personaId);
            double scoreB = calculatePersonaScore(b, personaId);
            return Double.compare(scoreB, scoreA); // Điểm cao hơn xếp trước
        });

        for (int i = 0; i < sorted.size(); i++) {
            ItemView item = sorted.get(i);
            item.setRank(i + 1);
            double pClick = Math.max(0.15, 0.98 - (i * 0.02));
            item.setPClick(pClick);
            item.setDecision(pClick >= 0.5 ? "CLICK" : "PASS");
            
            double discount = item.getDiscountRate() != null ? item.getDiscountRate() : 0.0;
            if (discount >= 40.0) {
                item.setPriceVolatilityTier("High");
            } else if (discount >= 15.0) {
                item.setPriceVolatilityTier("Medium");
            } else {
                item.setPriceVolatilityTier("Low");
            }
        }

        return sorted;
    }

    private double calculatePersonaScore(ItemView item, int personaId) {
        double discount = item.getDiscountRate() != null ? item.getDiscountRate() : 0.0;
        double sold = item.getSoldCount() != null ? item.getSoldCount() : 0.0;
        double rating = item.getRatingAverage() != null ? item.getRatingAverage() : 4.5;
        double reviews = item.getReviewCount() != null ? item.getReviewCount() : 0;
        double price = item.getCurrentPrice() != null && item.getCurrentPrice() > 0 ? item.getCurrentPrice() : 100000.0;

        return switch (personaId) {
            case 0 -> // Deal Hunter: trọng số giảm giá cực lớn (95% discount sẽ đứng top 1)
                (discount * 20.0) + (sold * 0.1) + (rating * 2.0);
            case 1 -> // Trend Chaser: ưu tiên độ hot, bán chạy
                (sold * 1.5) + (reviews * 0.5) + (discount * 2.0);
            case 2 -> // Quality Seeker: ưu tiên rating 5 sao & đánh giá
                (rating * 100.0) + (reviews * 0.5);
            case 3 -> // Frugal: ưu tiên giá rẻ nhất
                (1_000_000.0 / price) * 100.0 + (discount * 5.0);
            case 4 -> // Brand Loyalist: shop chính hãng & đánh giá uy tín
                (item.getShopName() != null && item.getShopName().contains("Chính Hãng") ? 200.0 : 50.0)
                        + (rating * 20.0) + (reviews * 0.2);
            default ->
                (sold * 0.7) + (rating * 10.0) + (discount * 2.0);
        };
    }
}
