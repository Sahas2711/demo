package com.inventra.backend.dto.inventory;

import java.math.BigDecimal;
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
public class ProductResponse {
    private UUID id;
    private String name;
    private String description;
    private String hsnCode;
    private BigDecimal unitPrice;
    private BigDecimal gstPercentage;
    private Integer quantityAvailable;
    private Integer reorderLevel;
    private boolean lowStock;
    private boolean active;
   // private CategoryResponse category;
    private Instant createdAt;
    private Instant updatedAt;
}
