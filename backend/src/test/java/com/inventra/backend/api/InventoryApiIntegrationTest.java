package com.inventra.backend.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventra.backend.dto.inventory.CategoryResponse;
import com.inventra.backend.dto.inventory.ProductRequest;
import com.inventra.backend.dto.inventory.ProductResponse;
import com.inventra.backend.dto.inventory.StockAdjustmentRequest;
import com.inventra.backend.security.CustomUserDetailsService;
import com.inventra.backend.security.JwtAuthenticationFilter;
import com.inventra.backend.security.RateLimitingFilter;
import com.inventra.backend.service.InventoryService;
import com.inventra.backend.support.AbstractPostgresContainerTest;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class InventoryApiIntegrationTest extends AbstractPostgresContainerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private RateLimitingFilter rateLimitingFilter;

    @Test
    void inventoryCrudFlowUsesExpectedEndpoints() throws Exception {
        ProductResponse response = productResponse();
        UUID productId = response.getId();
        UUID categoryId = response.getCategory().getId();

        when(inventoryService.createProduct(any(ProductRequest.class))).thenReturn(response);
        when(inventoryService.getProducts(any())).thenReturn(new PageImpl<>(List.of(response)));
        when(inventoryService.getProductById(productId)).thenReturn(response);
        when(inventoryService.updateProduct(eq(productId), any(ProductRequest.class))).thenReturn(response);
        when(inventoryService.adjustStock(eq(productId), any(StockAdjustmentRequest.class))).thenReturn(response);

        ProductRequest request = ProductRequest.builder()
                .name("Ultra Cement")
                .description("Premium cement")
                .hsnCode("2523")
                .unitPrice(new BigDecimal("350.00"))
                .gstPercentage(new BigDecimal("18"))
                .categoryId(categoryId)
                .quantityAvailable(5)
                .reorderLevel(10)
                .active(true)
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .with(user("admin").roles("ADMIN"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(productId.toString()));

        mockMvc.perform(get("/api/v1/products").with(user("viewer").roles("VIEWER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Ultra Cement"));

        mockMvc.perform(get("/api/v1/products/{id}", productId).with(user("viewer").roles("VIEWER")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hsnCode").value("2523"));

        mockMvc.perform(put("/api/v1/products/{id}", productId)
                        .with(user("staff").roles("STAFF"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ultra Cement"));

        mockMvc.perform(put("/api/v1/inventory/{productId}", productId)
                        .with(user("staff").roles("STAFF"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(StockAdjustmentRequest.builder()
                                .quantityAvailable(25)
                                .reorderLevel(8)
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lowStock").value(true));

        mockMvc.perform(delete("/api/v1/products/{id}", productId)
                        .with(user("admin").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Product deactivated successfully"));
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
