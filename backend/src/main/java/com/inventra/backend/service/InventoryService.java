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
public class InventoryService {
    private static final Logger log = Logger.getLogger(InventoryService.class.getName());

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

        Category category = new Category();
        category.setName(sanitizedName);
        category.setDescription(inputSanitizer.sanitize(request.getDescription()));
        Category saved = categoryRepository.save(category);
        auditLogService.log(AuditActionType.CREATE, "Category", saved.getId().toString(), null, null, "created");
        log.info("Category created: id=" + saved.getId() + ", name=" + saved.getName());
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
        log.info("Category updated: id=" + saved.getId());
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
        log.warning("Category deleted: id=" + category.getId());
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        validateGstSlab(request.getGstPercentage());
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));

        Product product = new Product();
        product.setName(inputSanitizer.sanitize(request.getName()));
        product.setDescription(inputSanitizer.sanitize(request.getDescription()));
        product.setHsnCode(inputSanitizer.sanitize(request.getHsnCode()));
        product.setUnitPrice(request.getUnitPrice());
        product.setGstPercentage(request.getGstPercentage());
        product.setQuantityAvailable(request.getQuantityAvailable());
        product.setReorderLevel(request.getReorderLevel());
        product.setActive(request.getActive() == null || request.getActive());
        product.setCategory(category);

        Product saved = productRepository.save(product);
        auditLogService.log(AuditActionType.CREATE, "Product", saved.getId().toString(), null, null, "created");
        log.info("Product created: id=" + saved.getId() + ", name=" + saved.getName());
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
        log.info("Product updated: id=" + saved.getId());
        return toProductResponse(saved);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        product.setActive(false);
        productRepository.save(product);
        auditLogService.log(AuditActionType.DELETE, "Product", product.getId().toString(), null, null, "deactivated");
        log.warning("Product deactivated: id=" + product.getId());
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
        log.info("Stock adjusted: id=" + saved.getId());
        return toProductResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream().map(this::toProductResponse).toList();
    }

    private ProductResponse toProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setHsnCode(product.getHsnCode());
        response.setUnitPrice(product.getUnitPrice());
        response.setGstPercentage(product.getGstPercentage());
        response.setQuantityAvailable(product.getQuantityAvailable());
        response.setReorderLevel(product.getReorderLevel());
        response.setLowStock(product.getQuantityAvailable() <= product.getReorderLevel());
        response.setActive(product.isActive());
        response.setCategory(product.getCategory() != null ? toCategoryResponse(product.getCategory()) : null);
        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        return response;
    }

    private CategoryResponse toCategoryResponse(Category category) {
        CategoryResponse response = new CategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());
        return response;
    }
}
