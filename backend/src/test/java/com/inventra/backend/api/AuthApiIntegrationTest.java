package com.inventra.backend.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventra.backend.auth.AuthService;
import com.inventra.backend.dto.auth.LoginRequest;
import com.inventra.backend.dto.auth.TokenResponse;
import com.inventra.backend.model.UserRole;
import com.inventra.backend.security.CustomUserDetailsService;
import com.inventra.backend.security.JwtAuthenticationFilter;
import com.inventra.backend.security.RateLimitingFilter;
import com.inventra.backend.support.AbstractPostgresContainerTest;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class AuthApiIntegrationTest extends AbstractPostgresContainerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    @MockBean
    private RateLimitingFilter rateLimitingFilter;

    @Test
    void loginEndpointReturnsJwtPair() throws Exception {
        when(authService.login(any(LoginRequest.class))).thenReturn(tokenResponse());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(LoginRequest.builder()
                                .email("admin@inventra.test")
                                .password("Password123!")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(cookie().exists("access_token"))
                .andExpect(cookie().exists("refresh_token"));
    }

    @Test
    void refreshEndpointAcceptsHeaderToken() throws Exception {
        when(authService.refreshToken("refresh-token", "203.0.113.10", "unknown-device")).thenReturn(tokenResponse());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .header("X-Refresh-Token", "refresh-token")
                        .header("X-Forwarded-For", "203.0.113.10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access-token"));
    }

    private TokenResponse tokenResponse() {
        return TokenResponse.builder()
                .accessToken("access-token")
                .refreshToken("refresh-token")
                .tokenType("Bearer")
                .expiresIn(900L)
                .user(TokenResponse.UserSummary.builder()
                        .id(UUID.randomUUID())
                        .name("Admin")
                        .email("admin@inventra.test")
                        .role(UserRole.ADMIN)
                        .build())
                .build();
    }
}
