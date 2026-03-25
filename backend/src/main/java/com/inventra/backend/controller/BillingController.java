package com.inventra.backend.controller;

import com.inventra.backend.dto.billing.InvoiceCreateRequest;
import com.inventra.backend.dto.billing.InvoiceResponse;
import com.inventra.backend.dto.billing.UpdateInvoiceStatusRequest;
import com.inventra.backend.service.BillingService;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody InvoiceCreateRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(billingService.createInvoice(request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping
    public Page<InvoiceResponse> getInvoices(Pageable pageable) {
        return billingService.getInvoices(pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping("/{id}")
    public InvoiceResponse getInvoiceById(@PathVariable UUID id) {
        return billingService.getInvoiceById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PutMapping("/{id}/status")
    public InvoiceResponse updateInvoiceStatus(@PathVariable UUID id, @Valid @RequestBody UpdateInvoiceStatusRequest request) {
        return billingService.updateInvoiceStatus(id, request.getStatus());
    }
}
