package com.inventra.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventra.backend.auth.TestWebSecurityConfig;
import com.inventra.backend.dto.inventory.CategoryResponse;
import com.inventra.backend.dto.inventory.ProductRequest;
import com.inventra.backend.dto.inventory.ProductResponse;
import com.inventra.backend.service.InventoryService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(InventoryController.class)
@Import(TestWebSecurityConfig.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

    @Test
    void createProductReturnsCreatedForAdmin() throws Exception {
        ProductResponse response = productResponse();
        when(inventoryService.createProduct(any(ProductRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/products")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest(response.getCategory().getId()))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Ultra Cement"));
    }

    @Test
    void createProductRejectsViewerRole() throws Exception {
        mockMvc.perform(post("/api/v1/products")
                        .with(user("viewer").roles("VIEWER"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productRequest(UUID.randomUUID()))))
                .andExpect(status().isForbidden());
    }

    @Test
    void getInventoryWithLowStockFlagUsesLowStockService() throws Exception {
        when(inventoryService.getLowStockProducts()).thenReturn(List.of(productResponse()));

        mockMvc.perform(get("/api/v1/inventory")
                        .with(user("staff").roles("STAFF"))
                        .queryParam("lowStock", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].lowStock").value(true));

        verify(inventoryService).getLowStockProducts();
    }

    @Test
    void getProductsReturnsPagedResponse() throws Exception {
        when(inventoryService.getProducts(any())).thenReturn(new PageImpl<>(List.of(productResponse())));

        mockMvc.perform(get("/api/v1/products").with(user("viewer").roles("VIEWER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].hsnCode").value("2523"));
    }

    private ProductRequest productRequest(UUID categoryId) {
        return ProductRequest.builder()
                .name("Ultra Cement")
                .description("Premium cement")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350.00"))
                .gstPercentage(new BigDecimal("18"))
                .categoryId(categoryId)
                .quantityAvailable(12)
                .reorderLevel(4)
                .active(true)
                .build();
    }

    private ProductResponse productResponse() {
        return ProductResponse.builder()
                .id(UUID.randomUUID())
                .name("Ultra Cement")
                .description("Premium cement")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350.00"))
                .gstPercentage(new BigDecimal("18"))
                .quantityAvailable(5)
                .reorderLevel(10)
                .lowStock(true)
                .active(true)
                .category(CategoryResponse.builder()
                        .id(UUID.randomUUID())
                        .name("Cement")
                        .description("Building materials")
                        .createdAt(Instant.now())
                        .updatedAt(Instant.now())
                        .build())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
    }
}
