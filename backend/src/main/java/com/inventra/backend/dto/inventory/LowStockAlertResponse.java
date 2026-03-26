package com.inventra.backend.dto.inventory;

import java.time.Instant;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockAlertResponse {
    private UUID productId;
    private String productName;
    private String categoryName;
    private Integer quantityAvailable;
    private Integer reorderLevel;
    private Integer shortfall;
    private String severity;
    private Instant updatedAt;
}