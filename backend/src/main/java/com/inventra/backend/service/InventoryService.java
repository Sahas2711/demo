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

    // @Autowired
    private final ProductRepository productRepository;
    // @Autowired   
    private final CategoryRepository categoryRepository;
    // @Autowired
    private final InputSanitizer inputSanitizer;
    // @Autowired
    private final AuditLogService auditLogService;

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String sanitizedName = inputSanitizer.sanitize(request.getName());
        if (categoryRepository.existsByNameIgnoreCase(sanitizedName)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
        }

        Category category = Category.builder()
            .name(sanitizedName)
            .description(inputSanitizer.sanitize(request.getDescription()))
                .build();
        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditActionType.CREATE, "Category", saved.getId().toString(), null, null, "created");
        log.info("Category created: id={}, name={}", saved.getId(), saved.getName());
        return toCategoryResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return categoryRepository.findAll().stream().map(this::toCategoryResponse).toList();
    }

    @Transactional
    public CategoryResponse updateCategory(UUID categoryId, CategoryRequest request) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        String sanitizedName = inputSanitizer.sanitize(request.getName());
        categoryRepository.findByNameIgnoreCase(sanitizedName).ifPresent(existing -> {
            if (!existing.getId().equals(categoryId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Category already exists");
            }
        });

        category.setName(sanitizedName);
        category.setDescription(inputSanitizer.sanitize(request.getDescription()));
        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditActionType.UPDATE, "Category", saved.getId().toString(), null, null, "updated");
        log.info("Category updated: id={}", saved.getId());
        return toCategoryResponse(saved);
    }

    @Transactional
    public void deleteCategory(UUID categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (productRepository.existsByCategoryId(categoryId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cannot delete category with assigned products");
        }
        categoryRepository.delete(category);
        auditLogService.log(AuditActionType.DELETE, "Category", category.getId().toString(), null, null, "deleted");
        log.warn("Category deleted: id={}", category.getId());
    }

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

    private void validateGstSlab(java.math.BigDecimal gstPercentage) {
        if (gstPercentage == null) return;
        java.util.Set<java.math.BigDecimal> validSlabs = java.util.Set.of(
            java.math.BigDecimal.ZERO,
            new java.math.BigDecimal("0.25"),
            new java.math.BigDecimal("3"),
            new java.math.BigDecimal("5"),
            new java.math.BigDecimal("12"),
            new java.math.BigDecimal("18"),
            new java.math.BigDecimal("28")
        );
        boolean valid = validSlabs.stream().anyMatch(s -> s.compareTo(gstPercentage) == 0);
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid GST slab: " + gstPercentage);
        }
    }

    @Transactional
    public ProductResponse adjustStock(UUID productId, StockAdjustmentRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        if (request.getQuantityAvailable() != null) {
            product.setQuantityAvailable(request.getQuantityAvailable());
        }
        if (request.getReorderLevel() != null) {
            product.setReorderLevel(request.getReorderLevel());
        }
        Product saved = productRepository.save(product);
        auditLogService.log(AuditActionType.UPDATE, "Product", saved.getId().toString(), null, null, "stock-adjusted");
        log.info("Stock adjusted: id={}", saved.getId());
        return toProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream().map(this::toProductResponse).toList();
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
                .category(product.getCategory() != null ? toCategoryResponse(product.getCategory()) : null)
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private CategoryResponse toCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}