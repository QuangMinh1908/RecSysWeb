package com.ecommerce.client;

import com.ecommerce.model.dto.ItemView;
import com.ecommerce.model.dto.ModelRequest;

import java.util.List;
import java.util.Map;

public interface ModelClient {
    List<ItemView> rankItems(
            int userId,
            int personaId,
            String preferredCategory,
            List<ItemView> items,
            Map<Long, List<ModelRequest.ProductSnapshot>> historyMap
    );
}
