package com.inventra.backend.service;

import com.inventra.backend.dto.customer.CustomerPurchaseHistoryResponse;
import com.inventra.backend.dto.customer.CustomerRequest;
import com.inventra.backend.dto.customer.CustomerResponse;
import com.inventra.backend.model.AuditActionType;
import com.inventra.backend.model.Customer;
import com.inventra.backend.repository.CustomerRepository;
import com.inventra.backend.repository.InvoiceRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.logging.Logger;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.inventra.backend.util.InputSanitizer;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private static final Logger log = Logger.getLogger(CustomerService.class.getName());

    private static final Pattern GSTIN_PATTERN = Pattern.compile("^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$");

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;
    private final InputSanitizer inputSanitizer;
    private final AuditLogService auditLogService;

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        validateGstin(request.getGstNumber());
        String phone = request.getPhone() != null ? request.getPhone().trim() : "";
        if (customerRepository.existsByPhone(phone)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already exists");
        }
        if (request.getGstNumber() != null && !request.getGstNumber().isBlank()
                && customerRepository.existsByGstNumber(request.getGstNumber().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GST number already exists");
        }

        Customer customer = new Customer();
        customer.setName(inputSanitizer.sanitize(request.getName()));
        customer.setPhone(phone);
        customer.setEmail(safeTrim(request.getEmail()));
        customer.setAddress(safeTrim(request.getAddress()));
        customer.setGstNumber(safeTrim(request.getGstNumber()));
        customer.setCreditLimit(request.getCreditLimit() == null ? BigDecimal.ZERO : request.getCreditLimit());
        customer.setActive(request.getActive() == null || request.getActive());
        Customer saved = customerRepository.save(customer);
        auditLogService.log(AuditActionType.CREATE, "Customer", saved.getId().toString(), null, null, "created");
        log.info("Customer created: id=" + saved.getId() + ", phone=" + saved.getPhone());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<CustomerResponse> getCustomers(Pageable pageable) {
        return customerRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse updateCustomer(UUID customerId, CustomerRequest request) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        validateGstin(request.getGstNumber());
        String newPhone = request.getPhone().trim();
        if (customerRepository.existsByPhoneAndIdNot(newPhone, customerId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already exists");
        }

        String gst = safeTrim(request.getGstNumber());
        if (gst != null && customerRepository.existsByGstNumberAndIdNot(gst, customerId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "GST number already exists");
        }

        customer.setName(inputSanitizer.sanitize(request.getName()));
        customer.setPhone(newPhone);
        customer.setEmail(safeTrim(request.getEmail()));
        customer.setAddress(safeTrim(request.getAddress()));
        customer.setGstNumber(gst);
        customer.setCreditLimit(request.getCreditLimit() == null ? BigDecimal.ZERO : request.getCreditLimit());
        if (request.getActive() != null) {
            customer.setActive(request.getActive());
        }
        Customer saved = customerRepository.save(customer);
        auditLogService.log(AuditActionType.UPDATE, "Customer", saved.getId().toString(), null, null, "updated");
        log.info("Customer updated: id=" + saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public void deleteCustomer(UUID customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        customer.setActive(false);
        customerRepository.save(customer);
        auditLogService.log(AuditActionType.DELETE, "Customer", customer.getId().toString(), null, null, "deactivated");
        log.warning("Customer deactivated: id=" + customer.getId());
    }

    @Transactional(readOnly = true)
    public List<CustomerPurchaseHistoryResponse> getPurchaseHistory(UUID customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        return invoiceRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(invoice -> {
                    CustomerPurchaseHistoryResponse response = new CustomerPurchaseHistoryResponse();
                    response.setInvoiceId(invoice.getId());
                    response.setInvoiceNumber(invoice.getInvoiceNumber());
                    response.setInvoiceDate(invoice.getCreatedAt());
                    response.setTotalAmount(invoice.getTotalAmount());
                    response.setGstAmount(invoice.getCgst().add(invoice.getSgst()).add(invoice.getIgst()));
                    response.setGrandTotal(invoice.getGrandTotal());
                    response.setStatus(invoice.getStatus().name());
                    return response;
                })
                .toList();
    }

    private void validateGstin(String gstNumber) {
        if (gstNumber == null || gstNumber.isBlank()) {
            return;
        }
        String normalized = gstNumber.trim().toUpperCase();
        if (!GSTIN_PATTERN.matcher(normalized).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid GSTIN format");
        }
    }

    private String safeTrim(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = inputSanitizer.sanitize(value);
        return trimmed.isEmpty() ? null : trimmed;
    }

    private CustomerResponse toResponse(Customer customer) {
        CustomerResponse response = new CustomerResponse();
        response.setId(customer.getId());
        response.setName(customer.getName());
        response.setPhone(customer.getPhone());
        response.setEmail(customer.getEmail());
        response.setAddress(customer.getAddress());
        response.setGstNumber(customer.getGstNumber());
        response.setCreditLimit(customer.getCreditLimit());
        response.setActive(customer.isActive());
        response.setCreatedAt(customer.getCreatedAt());
        response.setUpdatedAt(customer.getUpdatedAt());
        return response;
    }
}
