package com.ecommerce.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Cors cors = new Cors();
    private Model model = new Model();
    private Search search = new Search();
    private Images images = new Images();

    @Data
    public static class Cors {
        private String allowedOrigins = "http://localhost:5173,http://127.0.0.1:5173";
    }

    @Data
    public static class Model {
        private String url = "http://localhost:8000";
        private int timeoutSeconds = 30;
    }

    @Data
    public static class Search {
        private int pageSize = 20;
        private int sessionTtlMinutes = 30;
    }

    @Data
    public static class Images {
        private String baseDir = "/home/ds300/data/image";
    }
}
