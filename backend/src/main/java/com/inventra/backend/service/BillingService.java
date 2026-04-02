package com.inventra.backend.service;

import com.inventra.backend.dto.billing.*;
import com.inventra.backend.model.*;
import com.inventra.backend.repository.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.*;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class BillingService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public InvoiceResponse createInvoice(InvoiceCreateRequest request, Authentication authentication) {

        // 🔹 STEP 1: Validate user
        User currentUser = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // 🔹 STEP 2: Validate customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        // 🔹 STEP 3: Validate items
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice items required");
        }

        // 🔹 STEP 4: Prevent duplicate products
        Set<UUID> uniqueProducts = new HashSet<>();
        for (InvoiceItemCreateRequest item : request.getItems()) {
            if (!uniqueProducts.add(item.getProductId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Duplicate product: " + item.getProductId());
            }
        }

        String invoiceNumber = generateInvoiceNumber();

        BigDecimal totalAmount = BigDecimal.ZERO;
        BigDecimal totalCgst = BigDecimal.ZERO;
        BigDecimal totalSgst = BigDecimal.ZERO;
        BigDecimal totalIgst = BigDecimal.ZERO;

        List<InvoiceItem> items = new ArrayList<>();

        boolean isInterState = request.isInterState();

        // 🔥 STEP 5: LOCK + PROCESS PRODUCTS
        for (InvoiceItemCreateRequest itemRequest : request.getItems()) {

            Product product = productRepository.findByIdForUpdate(itemRequest.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                            "Product not found: " + itemRequest.getProductId()));

            if (!product.isActive()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Inactive product: " + product.getName());
            }

            int requestedQty = itemRequest.getQuantity();

            if (product.getQuantityAvailable() < requestedQty) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Insufficient stock: " + product.getName());
            }

            // 🔐 ALWAYS trust DB price
            BigDecimal unitPrice = product.getUnitPrice();
            BigDecimal gstRate = product.getGstPercentage();

            GstResult gst = calculateGst(unitPrice, requestedQty, gstRate, isInterState);

            totalAmount = totalAmount.add(gst.taxableAmount);
            totalCgst = totalCgst.add(gst.cgst);
            totalSgst = totalSgst.add(gst.sgst);
            totalIgst = totalIgst.add(gst.igst);

            // 🔥 STOCK UPDATE (no save needed)
            product.setQuantityAvailable(product.getQuantityAvailable() - requestedQty);

            InvoiceItem item = InvoiceItem.builder()
                    .product(product)
                    .quantity(requestedQty)
                    .unitPrice(unitPrice)
                    .gstPercentage(gstRate)
                    .totalPrice(gst.taxableAmount)
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

        // 🔹 STEP 6: Create invoice
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

        // 🔹 STEP 7: Attach items (cascade will save)
        items.forEach(i -> i.setInvoice(invoice));
        invoice.setItems(items);

        Invoice savedInvoice = invoiceRepository.save(invoice);

        auditLogService.log(AuditActionType.CREATE, "Invoice",
                savedInvoice.getId().toString(), currentUser, null, "created");

        log.info("Invoice created: {}", savedInvoice.getInvoiceNumber());

        return toInvoiceResponse(savedInvoice);
    }

    // 🔥 GST ENGINE
    private GstResult calculateGst(BigDecimal unitPrice, int quantity,
                                  BigDecimal gstRate, boolean isInterState) {

        BigDecimal taxable = unitPrice.multiply(BigDecimal.valueOf(quantity))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal gstAmount = taxable.multiply(gstRate)
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

        return new GstResult(taxable, cgst, sgst, igst);
    }

    private static class GstResult {
        BigDecimal taxableAmount, cgst, sgst, igst;

        GstResult(BigDecimal t, BigDecimal c, BigDecimal s, BigDecimal i) {
            this.taxableAmount = t;
            this.cgst = c;
            this.sgst = s;
            this.igst = i;
        }
    }

    private BigDecimal round(BigDecimal val) {
        return val.setScale(2, RoundingMode.HALF_UP);
    }

    private String generateInvoiceNumber() {
        LocalDate now = LocalDate.now(ZoneOffset.UTC);
        String prefix = "INV-" + now.getYear() + "-";

        for (int i = 0; i < 10; i++) {
            String num = prefix + String.format("%05d", new Random().nextInt(100000));
            if (!invoiceRepository.existsByInvoiceNumber(num)) return num;
        }

        return prefix + System.currentTimeMillis();
    }

    @Transactional(readOnly = true)
    public Page<InvoiceResponse> getInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::toInvoiceResponse);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(UUID id) {
        return invoiceRepository.findById(id)
                .map(this::toInvoiceResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));
    }

    @Transactional
    public InvoiceResponse updateInvoiceStatus(UUID id, InvoiceStatus status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Invoice not found"));
        invoice.setStatus(status);
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice status updated: id={}, status={}", saved.getId(), saved.getStatus());
        return toInvoiceResponse(saved);
    }

    private InvoiceResponse toInvoiceResponse(Invoice invoice) {
        List<InvoiceItemResponse> items = invoice.getItems().stream().map(i ->
                InvoiceItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .gstPercentage(i.getGstPercentage())
                        .totalPrice(i.getTotalPrice())
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
                .items(items)
                .createdAt(invoice.getCreatedAt())
                .build();
    }
}