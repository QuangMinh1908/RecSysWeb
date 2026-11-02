package com.ecommerce.service;

import com.ecommerce.model.dto.ProductDto;
import com.ecommerce.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final int searchLimit;

    public ProductService(ProductRepository productRepository,
                          @Value("${app.search.limit:10}") int searchLimit) {
        this.productRepository = productRepository;
        this.searchLimit = searchLimit;
    }

    /**
     * Logic tạm thời (mock thay cho RecSys): ILIKE %keyword%, tối đa 10 kết quả.
     * Keyword rỗng sẽ trả về 10 sản phẩm đầu tiên để trang chủ có dữ liệu hiển thị.
     * <p>
     * TODO (giai đoạn tích hợp): lấy tập sản phẩm thô, gửi kèm keyword + userId
     * sang FastAPI POST /recommend và trả về 5-10 item đã được xếp hạng.
     */
    @Transactional(readOnly = true)
    public List<ProductDto> search(String keyword, Long userId) {
        String normalized = keyword == null ? "" : keyword.trim();
        log.info("Search keyword='{}' userId={}", normalized, userId);

        return productRepository.searchByKeyword(escapeLike(normalized), searchLimit)
                .stream()
                .map(ProductDto::from)
                .toList();
    }

    /** Vô hiệu hoá các ký tự đặc biệt của LIKE để người dùng gõ '%' hay '_' vẫn tìm đúng. */
    private static String escapeLike(String input) {
        return input.replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
