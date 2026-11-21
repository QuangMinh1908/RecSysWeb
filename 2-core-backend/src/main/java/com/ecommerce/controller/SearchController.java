package com.ecommerce.controller;

import com.ecommerce.model.dto.SearchPage;
import com.ecommerce.model.dto.SearchRequest;
import com.ecommerce.service.SearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping
    public ResponseEntity<SearchPage> search(@Valid @RequestBody SearchRequest request) {
        SearchPage page = searchService.search(request);
        return ResponseEntity.ok(page);
    }

    @GetMapping
    public ResponseEntity<SearchPage> getPage(
            @RequestParam("sessionId") String sessionId,
            @RequestParam(value = "page", defaultValue = "1") int page
    ) {
        SearchPage result = searchService.getPage(sessionId, page);
        return ResponseEntity.ok(result);
    }
}
