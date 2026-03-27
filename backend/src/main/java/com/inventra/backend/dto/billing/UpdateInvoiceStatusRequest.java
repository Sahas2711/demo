package com.inventra.backend.dto.billing;

import com.inventra.backend.model.InvoiceStatus;
import jakarta.validation.constraints.NotNull;
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
public class UpdateInvoiceStatusRequest {
    @NotNull
    private InvoiceStatus status;
}