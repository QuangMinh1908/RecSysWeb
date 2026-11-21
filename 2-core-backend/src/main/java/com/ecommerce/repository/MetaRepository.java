package com.ecommerce.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MetaRepository {

    private final JdbcTemplate jdbcTemplate;

    public List<String> findKeywords() {
        return jdbcTemplate.queryForList("SELECT keyword_id FROM keywords ORDER BY keyword_id", String.class);
    }

    public List<String> findAvailableDates(String keywordId) {
        String sql = "SELECT DISTINCT TO_CHAR(imported_date, 'YYYY-MM-DD') " +
                     "FROM items WHERE keyword_id = ? ORDER BY 1 DESC";
        return jdbcTemplate.queryForList(sql, String.class, keywordId);
    }

    public String findLatestDate(String keywordId) {
        List<String> dates = findAvailableDates(keywordId);
        return dates.isEmpty() ? null : dates.get(0);
    }
}
