package com.inventra.backend.service;

import com.inventra.backend.dto.inventory.CategoryRequest;
import com.inventra.backend.dto.inventory.CategoryResponse;
import com.inventra.backend.dto.inventory.ProductRequest;
import com.inventra.backend.dto.inventory.ProductResponse;
import com.inventra.backend.dto.inventory.StockAdjustmentRequest;
import com.inventra.backend.model.AuditActionType;
import com.inventra.backend.model.Category;
import com.inventra.backend.model.Product;
import com.inventra.backend.repository.CategoryRepository;
import com.inventra.backend.repository.ProductRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.inventra.backend.util.InputSanitizer;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

	@Autowired
    private final ProductRepository productRepository;
	@Autowired
    private final InputSanitizer inputSanitizer;
	@Autowired
    private final AuditLogService auditLogService;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateGstSlab(request.getGstPercentage());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        Product product = Product.builder()
            .name(inputSanitizer.sanitize(request.getName()))
            .description(inputSanitizer.sanitize(request.getDescription()))
            .hsnCode(inputSanitizer.sanitize(request.getHsnCode()))
                .unitPrice(request.getUnitPrice())
                .gstPercentage(request.getGstPercentage())
                .quantityAvailable(request.getQuantityAvailable())
                .reorderLevel(request.getReorderLevel())
                .active(request.getActive() == null || request.getActive())
                .category(category)
                .build();

        Product saved = productRepository.save(product);
        auditLogService.log(AuditActionType.CREATE, "Product", saved.getId().toString(), null, null, "created");
        log.info("Product created: id={}, name={}", saved.getId(), saved.getName());
        return toProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getProducts(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::toProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return toProductResponse(product);
    }

    @Transactional
    public ProductResponse updateProduct(UUID productId, ProductRequest request) {
        validateGstSlab(request.getGstPercentage());
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        product.setName(inputSanitizer.sanitize(request.getName()));
        product.setDescription(inputSanitizer.sanitize(request.getDescription()));
        product.setHsnCode(inputSanitizer.sanitize(request.getHsnCode()));
        product.setUnitPrice(request.getUnitPrice());
        product.setGstPercentage(request.getGstPercentage());
        product.setQuantityAvailable(request.getQuantityAvailable());
        product.setReorderLevel(request.getReorderLevel());
        product.setCategory(category);
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        Product saved = productRepository.save(product);
        auditLogService.log(AuditActionType.UPDATE, "Product", saved.getId().toString(), null, null, "updated");
        log.info("Product updated: id={}", saved.getId());
        return toProductResponse(saved);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setActive(false);
        productRepository.save(product);
        auditLogService.log(AuditActionType.DELETE, "Product", product.getId().toString(), null, null, "deactivated");
        log.warn("Product deactivated: id={}", product.getId());
    }

    @Transactional
    public ProductResponse adjustStock(UUID productId, StockAdjustmentRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        product.setQuantityAvailable(request.getQuantityAvailable());
        if (request.getReorderLevel() != null) {
            product.setReorderLevel(request.getReorderLevel());
        }

        Product saved = productRepository.save(product);
        auditLogService.log(AuditActionType.UPDATE, "Product", saved.getId().toString(), null, null, "stock-adjusted");
        log.info("Product stock adjusted: id={}, qty={}", saved.getId(), saved.getQuantityAvailable());
        return toProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::toProductResponse)
                .toList();
    }

    private void validateGstSlab(java.math.BigDecimal gst) {
        if (gst == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "GST percentage is required");
        }
        boolean valid = gst.compareTo(java.math.BigDecimal.ZERO) == 0
                || gst.compareTo(java.math.BigDecimal.valueOf(5)) == 0
                || gst.compareTo(java.math.BigDecimal.valueOf(12)) == 0
                || gst.compareTo(java.math.BigDecimal.valueOf(18)) == 0
                || gst.compareTo(java.math.BigDecimal.valueOf(28)) == 0;
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid GST slab");
        }
    }

    private ProductResponse toProductResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .hsnCode(product.getHsnCode())
                .unitPrice(product.getUnitPrice())
                .gstPercentage(product.getGstPercentage())
                .quantityAvailable(product.getQuantityAvailable())
                .reorderLevel(product.getReorderLevel())
                .lowStock(product.getQuantityAvailable() <= product.getReorderLevel())
                .active(product.isActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }


}
