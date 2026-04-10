package com.inventra.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.inventra.backend.dto.inventory.CategoryRequest;
import com.inventra.backend.dto.inventory.ProductRequest;
import com.inventra.backend.dto.inventory.ProductResponse;
import com.inventra.backend.dto.inventory.StockAdjustmentRequest;
import com.inventra.backend.model.Category;
import com.inventra.backend.model.Product;
import com.inventra.backend.repository.CategoryRepository;
import com.inventra.backend.repository.ProductRepository;
import com.inventra.backend.util.InputSanitizer;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private InputSanitizer inputSanitizer;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private InventoryService inventoryService;

    @Test
    void createCategorySanitizesInputAndPersists() {
        CategoryRequest request = CategoryRequest.builder()
                .name(" <b>Cement</b> ")
                .description(" <script>x</script>desc ")
                .build();

        when(inputSanitizer.sanitize(request.getName())).thenReturn("Cement");
        when(inputSanitizer.sanitize(request.getDescription())).thenReturn("desc");
        when(categoryRepository.existsByNameIgnoreCase("Cement")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(UUID.randomUUID());
            return category;
        });

        var response = inventoryService.createCategory(request);

        assertEquals("Cement", response.getName());
        assertEquals("desc", response.getDescription());
    }

    @Test
    void createProductRejectsInvalidGstSlab() {
        ProductRequest request = ProductRequest.builder()
                .name("Cement")
                .description("desc")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350"))
                .gstPercentage(new BigDecimal("7"))
                .categoryId(UUID.randomUUID())
                .quantityAvailable(10)
                .reorderLevel(2)
                .build();

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> inventoryService.createProduct(request));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
    }

    @Test
    void createProductDefaultsActiveToTrue() {
        UUID categoryId = UUID.randomUUID();
        Category category = Category.builder().id(categoryId).name("Cement").build();
        ProductRequest request = ProductRequest.builder()
                .name("Cement Bag")
                .description("Premium")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350"))
                .gstPercentage(new BigDecimal("18"))
                .categoryId(categoryId)
                .quantityAvailable(10)
                .reorderLevel(2)
                .build();

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(inputSanitizer.sanitize("Cement Bag")).thenReturn("Cement Bag");
        when(inputSanitizer.sanitize("Premium")).thenReturn("Premium");
        when(inputSanitizer.sanitize("2523")).thenReturn("2523");
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            product.setId(UUID.randomUUID());
            return product;
        });

        ProductResponse response = inventoryService.createProduct(request);

        assertTrue(response.isActive());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    void adjustStockUpdatesQuantityAndReorderLevel() {
        UUID productId = UUID.randomUUID();
        Category category = Category.builder().id(UUID.randomUUID()).name("Cement").build();
        Product product = Product.builder()
                .id(productId)
                .name("Ultra Cement")
                .description("Premium")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350"))
                .gstPercentage(new BigDecimal("18"))
                .quantityAvailable(5)
                .reorderLevel(10)
                .active(true)
                .category(category)
                .build();

        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .quantityAvailable(20)
                .reorderLevel(4)
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(product)).thenReturn(product);

        ProductResponse response = inventoryService.adjustStock(productId, request);

        assertEquals(20, response.getQuantityAvailable());
        assertEquals(4, response.getReorderLevel());
        assertFalse(response.isLowStock());
    }

    @Test
    void deleteCategoryRejectsWhenProductsExist() {
        UUID categoryId = UUID.randomUUID();
        Category category = Category.builder().id(categoryId).name("Cement").build();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(category));
        when(productRepository.existsByCategoryId(categoryId)).thenReturn(true);

        ResponseStatusException exception = assertThrows(ResponseStatusException.class, () -> inventoryService.deleteCategory(categoryId));

        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
        assertEquals("Cannot delete category with assigned products", exception.getReason());
    }

    @Test
    void getLowStockProductsReturnsMappedResponses() {
        Category category = Category.builder().id(UUID.randomUUID()).name("Cement").build();
        Product lowStock = Product.builder()
                .id(UUID.randomUUID())
                .name("Ultra Cement")
                .description("Premium")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350"))
                .gstPercentage(new BigDecimal("18"))
                .quantityAvailable(2)
                .reorderLevel(5)
                .active(true)
                .category(category)
                .build();
        when(productRepository.findLowStockProducts()).thenReturn(List.of(lowStock));

        List<ProductResponse> responses = inventoryService.getLowStockProducts();

        assertEquals(1, responses.size());
        assertTrue(responses.get(0).isLowStock());
        assertEquals("Ultra Cement", responses.get(0).getName());
    }
}
