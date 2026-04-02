package com.inventra.backend.dto.customer;

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
public class CustomerPurchaseHistoryResponse {
    private UUID invoiceId;
    private String invoiceNumber;
    private Instant invoiceDate;
    private BigDecimal totalAmount;
    private BigDecimal gstAmount;
    private BigDecimal grandTotal;
    private String status;
}
