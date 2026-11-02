package com.ecommerce.service;

import com.ecommerce.model.dto.InteractionRequest;
import com.ecommerce.model.entity.UserInteraction;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserInteractionRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class InteractionService {

    private final UserInteractionRepository interactionRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /** Ghi lại một hành vi (click / cart / buy) của người dùng lên sản phẩm. */
    @Transactional
    public void record(InteractionRequest request) {
        if (!userRepository.existsById(request.userId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy user " + request.userId());
        }
        if (!productRepository.existsById(request.productId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm " + request.productId());
        }

        UserInteraction interaction = new UserInteraction();
        interaction.setUserId(request.userId());
        interaction.setProductId(request.productId());
        interaction.setInteractionType(request.type());
        interactionRepository.save(interaction);
    }
}
