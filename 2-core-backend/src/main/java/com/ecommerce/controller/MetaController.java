package com.ecommerce.controller;

import com.ecommerce.repository.MetaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/meta")
@RequiredArgsConstructor
public class MetaController {

    private final MetaRepository metaRepository;

    @GetMapping("/keywords")
    public ResponseEntity<List<String>> getKeywords() {
        return ResponseEntity.ok(metaRepository.findKeywords());
    }

    @GetMapping("/dates/{keywordId}")
    public ResponseEntity<List<String>> getDates(@PathVariable("keywordId") String keywordId) {
        return ResponseEntity.ok(metaRepository.findAvailableDates(keywordId));
    }
}
