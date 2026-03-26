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
public class CustomerResponse {
    private UUID id;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String gstNumber;
    private BigDecimal creditLimit;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}