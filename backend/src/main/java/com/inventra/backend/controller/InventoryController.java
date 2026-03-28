package com.inventra.backend.controller;

import com.inventra.backend.dto.auth.MessageResponse;
import com.inventra.backend.dto.inventory.CategoryRequest;
import com.inventra.backend.dto.inventory.CategoryResponse;
import com.inventra.backend.dto.inventory.ProductRequest;
import com.inventra.backend.dto.inventory.ProductResponse;
import com.inventra.backend.dto.inventory.StockAdjustmentRequest;
import com.inventra.backend.service.InventoryService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping("/categories")
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createCategory(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping("/categories")
    public List<CategoryResponse> getCategories() {
        return inventoryService.getCategories();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PutMapping("/categories/{id}")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request) {
        return inventoryService.updateCategory(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/categories/{id}")
    public MessageResponse deleteCategory(@PathVariable UUID id) {
        inventoryService.deleteCategory(id);
        return MessageResponse.builder().message("Category deleted successfully").build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping("/products")
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventoryService.createProduct(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping("/products")
    public Page<ProductResponse> getProducts(Pageable pageable) {
        return inventoryService.getProducts(pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping("/products/{id}")
    public ProductResponse getProductById(@PathVariable UUID id) {
        return inventoryService.getProductById(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PutMapping("/products/{id}")
    public ProductResponse updateProduct(@PathVariable UUID id, @Valid @RequestBody ProductRequest request) {
        return inventoryService.updateProduct(id, request);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/products/{id}")
    public MessageResponse deleteProduct(@PathVariable UUID id) {
        inventoryService.deleteProduct(id);
        return MessageResponse.builder().message("Product deactivated successfully").build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PutMapping("/inventory/{productId}")
    public ProductResponse adjustStock(@PathVariable UUID productId, @Valid @RequestBody StockAdjustmentRequest request) {
        return inventoryService.adjustStock(productId, request);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping("/inventory")
    public List<ProductResponse> getInventory(@RequestParam(defaultValue = "false") boolean lowStock) {
        if (lowStock) {
            return inventoryService.getLowStockProducts();
        }
        return inventoryService.getProducts(Pageable.unpaged()).getContent();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'VIEWER')")
    @GetMapping("/inventory/low-stock")
    public List<ProductResponse> lowStockProducts() {
        return inventoryService.getLowStockProducts();
    }
}
