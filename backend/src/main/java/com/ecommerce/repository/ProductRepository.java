package com.ecommerce.repository;

import com.ecommerce.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    /** Tìm theo tên, không phân biệt hoa/thường (ILIKE của PostgreSQL). */
    @Query(value = """
            SELECT * FROM products
            WHERE name ILIKE CONCAT('%', :keyword, '%')
            ORDER BY id
            LIMIT :limit
            """, nativeQuery = true)
    List<Product> searchByKeyword(@Param("keyword") String keyword, @Param("limit") int limit);
}
