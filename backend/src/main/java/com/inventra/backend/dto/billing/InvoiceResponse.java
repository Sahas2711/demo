package com.inventra.backend.dto.billing;

import java.math.BigDecimal;
import java.time.Instant;
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
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private UUID customerId;
    private String customerName;
    private UUID createdBy;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal cgst;
    private BigDecimal sgst;
    private BigDecimal igst;
    private BigDecimal grandTotal;
    private String notes;
    private LocalDate dueDate;
    private List<InvoiceItemResponse> items;
    private Instant createdAt;
}
