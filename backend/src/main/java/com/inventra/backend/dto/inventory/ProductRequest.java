package com.inventra.backend.dto.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
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
public class ProductRequest {

    @NotBlank
    @Size(min = 2, max = 200)
    private String name;

    @Size(max = 1000)
    private String description;

    @NotBlank
    @Size(max = 20)
    private String hsnCode;

    @NotNull
    @DecimalMin(value = "0.0")
    private BigDecimal unitPrice;

    @NotNull
    private BigDecimal gstPercentage;

    @NotNull
    private UUID categoryId;

    @NotNull
    @Min(0)
    private Integer quantityAvailable;

    @NotNull
    @Min(0)
    private Integer reorderLevel;

    private Boolean active;
}
