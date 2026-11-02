package com.ecommerce.controller;

import com.ecommerce.model.dto.ProductDto;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class SearchController {

    private final ProductService productService;

    /** GET /api/v1/search?keyword={key}&userId={id} */
    @GetMapping("/search")
    public List<ProductDto> search(@RequestParam(defaultValue = "") String keyword,
                                   @RequestParam(required = false) Long userId) {
        return productService.search(keyword, userId);
    }
}
