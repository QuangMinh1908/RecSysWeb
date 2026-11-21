package com.ecommerce.service;

import com.ecommerce.config.AppProperties;
import com.ecommerce.model.dto.ItemView;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class QuerySessionStore {

    private final AppProperties appProperties;
    private final ConcurrentMap<String, CachedSession> store = new ConcurrentHashMap<>();
    private ScheduledExecutorService cleanupExecutor;

    record CachedSession(List<ItemView> items, Instant createdAt) {}

    @PostConstruct
    public void init() {
        cleanupExecutor = Executors.newSingleThreadScheduledExecutor();
        cleanupExecutor.scheduleAtFixedRate(this::cleanupExpiredSessions, 5, 5, TimeUnit.MINUTES);
    }

    @PreDestroy
    public void shutdown() {
        if (cleanupExecutor != null) {
            cleanupExecutor.shutdown();
        }
    }

    public void save(String sessionId, List<ItemView> items) {
        store.put(sessionId, new CachedSession(items, Instant.now()));
    }

    public List<ItemView> get(String sessionId) {
        CachedSession s = store.get(sessionId);
        return s != null ? s.items() : null;
    }

    private void cleanupExpiredSessions() {
        long ttlMillis = TimeUnit.MINUTES.toMillis(appProperties.getSearch().getSessionTtlMinutes());
        Instant now = Instant.now();
        store.entrySet().removeIf(entry ->
                now.toEpochMilli() - entry.getValue().createdAt().toEpochMilli() > ttlMillis);
    }
}
