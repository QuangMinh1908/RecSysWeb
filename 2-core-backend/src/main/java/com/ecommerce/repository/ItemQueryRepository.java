package com.ecommerce.repository;

import com.ecommerce.model.dto.ItemView;
import com.ecommerce.model.dto.ModelRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
@RequiredArgsConstructor
public class ItemQueryRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<ItemView> findItemsByKeywordAndDate(String keywordId, String dateStr) {
        String sql = """
            SELECT i.item_id, i.name, i.category, i.brand_id, i.seller_id,
                   i.original_price, i.shop_name, i.image_path,
                   s.price, s.discount_rate, s.rating_average, s.review_count, s.sold_count
            FROM items i
            LEFT JOIN snapshots s ON i.item_id = s.item_id AND s.snapshot_date = ?::date
            WHERE i.keyword_id = ? AND i.imported_date = ?::date
            ORDER BY i.item_id ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            long itemId = rs.getLong("item_id");
            double origPrice = rs.getDouble("original_price");
            double currentPrice = rs.getObject("price") != null ? rs.getDouble("price") : origPrice;

            return ItemView.builder()
                    .itemId(itemId)
                    .name(rs.getString("name"))
                    .category(rs.getString("category"))
                    .brandId(rs.getLong("brand_id"))
                    .sellerId(rs.getLong("seller_id"))
                    .originalPrice(origPrice)
                    .currentPrice(currentPrice)
                    .discountRate(rs.getDouble("discount_rate"))
                    .ratingAverage(rs.getDouble("rating_average") > 0 ? rs.getDouble("rating_average") : 4.5)
                    .reviewCount(rs.getInt("review_count"))
                    .soldCount(rs.getDouble("sold_count"))
                    .shopName(rs.getString("shop_name"))
                    .imageUrl(rs.getString("image_path"))
                    .build();
        }, dateStr, keywordId, dateStr);
    }

    public List<ItemView> findBaselineItemsByKeywordAndDate(String keywordId, String dateStr) {
        String sql = """
            SELECT i.item_id, i.name, i.category, i.brand_id, i.seller_id,
                   i.original_price, i.shop_name, i.image_path,
                   s.price, s.discount_rate, s.rating_average, s.review_count, s.sold_count
            FROM items i
            LEFT JOIN snapshots s ON i.item_id = s.item_id AND s.snapshot_date = ?::date
            WHERE i.keyword_id = ? AND i.imported_date = ?::date
            ORDER BY i.item_id ASC
        """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            long itemId = rs.getLong("item_id");
            double origPrice = rs.getDouble("original_price");
            double currentPrice = rs.getObject("price") != null ? rs.getDouble("price") : origPrice;

            return ItemView.builder()
                    .itemId(itemId)
                    .name(rs.getString("name"))
                    .category(rs.getString("category"))
                    .brandId(rs.getLong("brand_id"))
                    .sellerId(rs.getLong("seller_id"))
                    .originalPrice(origPrice)
                    .currentPrice(currentPrice)
                    .discountRate(rs.getDouble("discount_rate"))
                    .ratingAverage(rs.getDouble("rating_average") > 0 ? rs.getDouble("rating_average") : 4.5)
                    .reviewCount(rs.getInt("review_count"))
                    .soldCount(rs.getDouble("sold_count"))
                    .shopName(rs.getString("shop_name"))
                    .imageUrl(rs.getString("image_path"))
                    .decision("BASELINE")
                    .priceVolatilityTier("Database")
                    .rank(rowNum + 1)
                    .build();
        }, dateStr, keywordId, dateStr);
    }

    public Map<Long, List<ModelRequest.ProductSnapshot>> findSnapshotsHistory(List<Long> itemIds, String upToDate) {
        if (itemIds == null || itemIds.isEmpty()) {
            return Collections.emptyMap();
        }

        String inSql = String.join(",", Collections.nCopies(itemIds.size(), "?"));
        String sql = String.format("""
            SELECT item_id, TO_CHAR(snapshot_date, 'YYYY-MM-DD') AS snap_date,
                   price, discount_rate, rating_average, review_count, sold_count
            FROM snapshots
            WHERE item_id IN (%s) AND snapshot_date <= ?::date
            ORDER BY item_id, snapshot_date ASC
        """, inSql);

        List<Object> params = new ArrayList<>(itemIds);
        params.add(upToDate);

        Map<Long, List<ModelRequest.ProductSnapshot>> historyMap = new HashMap<>();

        jdbcTemplate.query(sql, rs -> {
            long itemId = rs.getLong("item_id");
            ModelRequest.ProductSnapshot snap = ModelRequest.ProductSnapshot.builder()
                    .snapshotDate(rs.getString("snap_date"))
                    .price(rs.getDouble("price"))
                    .discountRate(rs.getDouble("discount_rate"))
                    .ratingAverage(rs.getDouble("rating_average"))
                    .reviewCount(rs.getInt("review_count"))
                    .soldCount(rs.getDouble("sold_count"))
                    .build();

            historyMap.computeIfAbsent(itemId, k -> new ArrayList<>()).add(snap);
        }, params.toArray());

        return historyMap;
    }
}
