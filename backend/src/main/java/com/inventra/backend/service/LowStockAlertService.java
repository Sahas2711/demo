package com.inventra.backend.service;

import com.inventra.backend.dto.inventory.LowStockAlertResponse;
import com.inventra.backend.model.Product;
import com.inventra.backend.repository.ProductRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LowStockAlertService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<LowStockAlertResponse> getLowStockAlerts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::toResponse)
                .toList();
    }

    private LowStockAlertResponse toResponse(Product product) {
        int shortfall = Math.max(product.getReorderLevel() - product.getQuantityAvailable(), 0);
        String severity;
        if (product.getQuantityAvailable() == 0) {
            severity = "CRITICAL";
        } else if (product.getQuantityAvailable() <= Math.max(product.getReorderLevel() / 2, 1)) {
            severity = "HIGH";
        } else {
            severity = "MEDIUM";
        }

        return LowStockAlertResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .categoryName(product.getCategory().getName())
                .quantityAvailable(product.getQuantityAvailable())
                .reorderLevel(product.getReorderLevel())
                .shortfall(shortfall)
                .severity(severity)
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}