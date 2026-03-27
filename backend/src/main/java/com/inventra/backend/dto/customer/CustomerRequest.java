package com.inventra.backend.dto.customer;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
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
public class CustomerRequest {

    @NotBlank
    @Size(min = 2, max = 200)
    private String name;

    @NotBlank
    @Size(min = 10, max = 20)
    private String phone;

    @Email
    private String email;

    @Size(max = 500)
    private String address;

    @Pattern(
            regexp = "^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$",
            message = "Invalid GSTIN format"
    )
    private String gstNumber;

    @DecimalMin(value = "0.0")
    private BigDecimal creditLimit;

    private Boolean active;
}