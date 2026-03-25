package com.inventra.backend.dto.billing;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;
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
public class InvoiceCreateRequest {

    @NotNull
    private UUID customerId;

    @NotEmpty
    private List<@Valid InvoiceItemCreateRequest> items;

    @Size(max = 1000)
    private String notes;

    private LocalDate dueDate;

    private boolean interState;
}
