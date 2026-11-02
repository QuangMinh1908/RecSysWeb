package com.ecommerce.controller;

import com.ecommerce.model.dto.InteractionRequest;
import com.ecommerce.service.InteractionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final InteractionService interactionService;

    /** POST /api/v1/interactions  {"userId":1,"productId":5,"type":"CLICK"} */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void record(@Valid @RequestBody InteractionRequest request) {
        interactionService.record(request);
    }
}
