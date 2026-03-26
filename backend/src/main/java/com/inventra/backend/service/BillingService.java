package com.inventra.backend.service;

import com.inventra.backend.dto.billing.InvoiceCreateRequest;
import com.inventra.backend.dto.billing.InvoiceItemCreateRequest;
import com.inventra.backend.dto.billing.InvoiceItemResponse;
import com.inventra.backend.dto.billing.InvoiceResponse;
import com.inventra.backend.model.*;
import com.inventra.backend.repository.*;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceItemRepository invoiceItemRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest request, Authentication authentication) {
        String email = authentication.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice items are required");
        }

        String invoiceNumber = generateInvoiceNumber();

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalCgst = BigDecimal.ZERO;
        BigDecimal totalSgst = BigDecimal.ZERO;
        BigDecimal totalIgst = BigDecimal.ZERO;

        List<InvoiceItem> items = new ArrayList<>();

        // 🔥 derive interstate (temporary assumption seller = MAHARASHTRA)
        boolean isInterState = customer.getState() != null &&
                !customer.getState().equalsIgnoreCase("MAHARASHTRA");

        for (InvoiceItemCreateRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + itemRequest.getProductId()));

            if (!product.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is inactive: " + product.getName());
            }

            int requestedQty = itemRequest.getQuantity();
            if (product.getQuantityAvailable() < requestedQty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Insufficient stock for product: " + product.getName());
            }

            BigDecimal unitPrice = itemRequest.getUnitPrice() != null
                    ? itemRequest.getUnitPrice()
                    : product.getUnitPrice();

            BigDecimal gstRate = product.getGstPercentage();

            if (gstRate.compareTo(BigDecimal.ZERO) < 0 || gstRate.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid GST rate for product: " + product.getName());
            }

            // 🔥 GST calculation via internal engine
            GstResult gstResult = calculateGst(unitPrice, requestedQty, gstRate, isInterState);

            totalAmount = totalAmount.add(gstResult.taxableAmount);
            totalCgst = totalCgst.add(gstResult.cgst);
            totalSgst = totalSgst.add(gstResult.sgst);
            totalIgst = totalIgst.add(gstResult.igst);

            product.setQuantityAvailable(product.getQuantityAvailable() - requestedQty);
            productRepository.save(product);

            InvoiceItem item = InvoiceItem.builder()
                    .product(product)
                    .quantity(requestedQty)
                    .unitPrice(unitPrice)
                    .gstPercentage(gstRate)
                    .totalPrice(gstResult.taxableAmount)
                    .build();

            items.add(item);
        }

        totalAmount = round(totalAmount);
        totalCgst = round(totalCgst);
        totalSgst = round(totalSgst);
        totalIgst = round(totalIgst);

        BigDecimal grandTotal = totalAmount
                .add(totalCgst)
                .add(totalSgst)
                .add(totalIgst)
                .setScale(2, RoundingMode.HALF_UP);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customer(customer)
                .createdBy(currentUser)
                .status(InvoiceStatus.SENT)
                .totalAmount(totalAmount)
                .cgst(totalCgst)
                .sgst(totalSgst)
                .igst(totalIgst)
                .grandTotal(grandTotal)
                .notes(request.getNotes())
                .dueDate(request.getDueDate())
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);

        items.forEach(i -> i.setInvoice(savedInvoice));
        List<InvoiceItem> savedItems = invoiceItemRepository.saveAll(items);
        savedInvoice.setItems(savedItems);

        auditLogService.log(AuditActionType.CREATE, "Invoice",
                savedInvoice.getId().toString(), currentUser, null, "created");

        log.info("Invoice created: id={}, invoiceNumber={}, customerId={}",
                savedInvoice.getId(), savedInvoice.getInvoiceNumber(), customer.getId());

        return toInvoiceResponse(savedInvoice);
    }

    // 🔥 GST ENGINE
    private GstResult calculateGst(BigDecimal unitPrice, int quantity,
                                  BigDecimal gstRate, boolean isInterState) {

        BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));

        BigDecimal taxableAmount = lineTotal.setScale(2, RoundingMode.HALF_UP);

        BigDecimal gstAmount = taxableAmount.multiply(gstRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal cgst = BigDecimal.ZERO;
        BigDecimal sgst = BigDecimal.ZERO;
        BigDecimal igst = BigDecimal.ZERO;

        if (isInterState) {
            igst = gstAmount;
        } else {
            cgst = gstAmount.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
            sgst = gstAmount.subtract(cgst);
        }

        return new GstResult(taxableAmount, cgst, sgst, igst);
    }

    private static class GstResult {
        BigDecimal taxableAmount;
        BigDecimal cgst;
        BigDecimal sgst;
        BigDecimal igst;

        GstResult(BigDecimal taxableAmount, BigDecimal cgst,
                  BigDecimal sgst, BigDecimal igst) {
            this.taxableAmount = taxableAmount;
            this.cgst = cgst;
            this.sgst = sgst;
            this.igst = igst;
        }
    }

    private BigDecimal round(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    @Transactional
    public InvoiceResponse updateInvoiceStatus(UUID invoiceId, InvoiceStatus targetStatus) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));

        InvoiceStatus current = invoice.getStatus();

        boolean validTransition =
                (current == InvoiceStatus.DRAFT && (targetStatus == InvoiceStatus.SENT || targetStatus == InvoiceStatus.CANCELLED))
                        || (current == InvoiceStatus.SENT && (targetStatus == InvoiceStatus.PAID || targetStatus == InvoiceStatus.CANCELLED))
                        || (current == InvoiceStatus.PAID && targetStatus == InvoiceStatus.PAID)
                        || (current == InvoiceStatus.CANCELLED && targetStatus == InvoiceStatus.CANCELLED);

        if (!validTransition) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid invoice status transition");
        }

        invoice.setStatus(targetStatus);
        Invoice saved = invoiceRepository.save(invoice);

        auditLogService.log(AuditActionType.UPDATE, "Invoice",
                saved.getId().toString(), saved.getCreatedBy(),
                current.name(), targetStatus.name());

        log.info("Invoice status updated: id={}, from={}, to={}",
                saved.getId(), current, targetStatus);

        return toInvoiceResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::toInvoiceResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));
        return toInvoiceResponse(invoice);
    }

    private String generateInvoiceNumber() {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        String prefix = "INV-" + now.getYear() + "-";
        int attempts = 0;

        while (attempts < 10) {
            String candidate = prefix + String.format("%05d", (int) (Math.random() * 100000));
            if (!invoiceRepository.existsByInvoiceNumber(candidate)) {
                return candidate;
            }
            attempts++;
        }

        return prefix + System.currentTimeMillis();
    }

    private InvoiceResponse toInvoiceResponse(Invoice invoice) {
        List<InvoiceItemResponse> itemResponses =
                invoice.getItems() == null ? List.of() :
                        invoice.getItems().stream().map(item ->
                                InvoiceItemResponse.builder()
                                        .id(item.getId())
                                        .productId(item.getProduct().getId())
                                        .productName(item.getProduct().getName())
                                        .quantity(item.getQuantity())
                                        .unitPrice(item.getUnitPrice())
                                        .gstPercentage(item.getGstPercentage())
                                        .totalPrice(item.getTotalPrice())
                                        .build()
                        ).toList();

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerId(invoice.getCustomer().getId())
                .customerName(invoice.getCustomer().getName())
                .createdBy(invoice.getCreatedBy().getId())
                .status(invoice.getStatus().name())
                .totalAmount(invoice.getTotalAmount())
                .cgst(invoice.getCgst())
                .sgst(invoice.getSgst())
                .igst(invoice.getIgst())
                .grandTotal(invoice.getGrandTotal())
                .notes(invoice.getNotes())
                .dueDate(invoice.getDueDate())
                .items(itemResponses)
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}