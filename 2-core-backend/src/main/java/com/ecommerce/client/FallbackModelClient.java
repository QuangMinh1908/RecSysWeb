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

        // Heuristic fallback: sort by sold_count DESC, rating DESC
        sorted.sort((a, b) -> {
            double scoreA = (a.getSoldCount() != null ? a.getSoldCount() : 0.0) * 0.7
                    + (a.getRatingAverage() != null ? a.getRatingAverage() : 0.0) * 100.0;
            double scoreB = (b.getSoldCount() != null ? b.getSoldCount() : 0.0) * 0.7
                    + (b.getRatingAverage() != null ? b.getRatingAverage() : 0.0) * 100.0;
            return Double.compare(scoreB, scoreA);
        });

        for (int i = 0; i < sorted.size(); i++) {
            ItemView item = sorted.get(i);
            item.setRank(i + 1);
            item.setPClick(Math.max(0.1, 0.95 - (i * 0.02)));
            item.setDecision(item.getPClick() >= 0.5 ? "CLICK" : "PASS");
            item.setPriceVolatilityTier("Medium");
        }

        return sorted;
    }
}
