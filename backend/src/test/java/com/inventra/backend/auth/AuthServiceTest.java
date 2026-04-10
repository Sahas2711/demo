package com.inventra.backend.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.inventra.backend.dto.auth.LoginRequest;
import com.inventra.backend.dto.auth.RegisterRequest;
import com.inventra.backend.dto.auth.TokenResponse;
import com.inventra.backend.model.RefreshToken;
import com.inventra.backend.model.User;
import com.inventra.backend.model.UserRole;
import com.inventra.backend.repository.RefreshTokenRepository;
import com.inventra.backend.repository.UserRepository;
import com.inventra.backend.security.JwtService;
import com.inventra.backend.service.AuditLogService;
import com.inventra.backend.util.InputSanitizer;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private InputSanitizer inputSanitizer;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() throws Exception {
        setField("maxFailedAttempts", 3);
        setField("lockDurationMinutes", 30L);
        SecurityContextHolder.clearContext();
    }

    @Test
    void registerCreatesStaffUserAndIssuesTokens() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alice")
                .email("Alice@Example.com")
                .password("Password123!")
                .deviceId("device-1")
                .ip("127.0.0.1")
                .userAgent("JUnit")
                .build();

        when(inputSanitizer.sanitize("Alice")).thenReturn("Alice");
        when(inputSanitizer.sanitize("Alice@Example.com")).thenReturn("Alice@Example.com");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("encoded-password");
        when(jwtService.generateAccessToken(any(User.class))).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refresh-token");
        when(jwtService.extractExpiration("refresh-token")).thenReturn(Instant.parse("2026-05-01T00:00:00Z"));
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TokenResponse response = authService.register(request);

        assertEquals("access-token", response.getAccessToken());
        assertEquals("refresh-token", response.getRefreshToken());
        assertEquals("alice@example.com", response.getUser().getEmail());
        assertEquals(UserRole.STAFF, response.getUser().getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerRejectsElevatedRoleForNonAdmin() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alice")
                .email("alice@example.com")
                .password("Password123!")
                .role(UserRole.ADMIN)
                .build();

        when(inputSanitizer.sanitize("alice@example.com")).thenReturn("alice@example.com");
        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void loginRejectsInactiveUser() {
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("Password123!")
                .build();
        User user = baseUser();
        user.setActive(false);

        when(inputSanitizer.sanitize("user@example.com")).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));

        assertThrows(DisabledException.class, () -> authService.login(request));
    }

    @Test
    void loginLocksAccountAfterMaxFailures() {
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("wrong")
                .build();
        User user = baseUser();
        user.setFailedLoginAttempts(2);

        when(inputSanitizer.sanitize("user@example.com")).thenReturn("user@example.com");
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
        assertTrue(user.isAccountLocked());
        assertEquals(3, user.getFailedLoginAttempts());
        verify(userRepository).save(user);
    }

    @Test
    void refreshTokenRejectsDeviceMismatch() {
        User user = baseUser();
        RefreshToken token = RefreshToken.builder()
                .token("refresh-token")
                .user(user)
                .deviceId("device-1")
                .ipAddress("10.0.0.1")
                .userAgent("JUnit")
                .expiresAt(Instant.now().plusSeconds(120))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(token));

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> authService.refreshToken("refresh-token", "10.0.0.1", "device-2")
        );

        assertEquals(HttpStatus.UNAUTHORIZED, exception.getStatusCode());
        assertEquals("Device mismatch", exception.getReason());
    }

    @Test
    void refreshTokenRevokesCurrentTokenAndIssuesNewPair() {
        User user = baseUser();
        RefreshToken token = RefreshToken.builder()
                .token("refresh-token")
                .user(user)
                .deviceId("device-1")
                .ipAddress("10.0.0.1")
                .userAgent("JUnit")
                .expiresAt(Instant.now().plusSeconds(120))
                .revoked(false)
                .build();

        when(refreshTokenRepository.findByToken("refresh-token")).thenReturn(Optional.of(token));
        when(jwtService.isTokenValid("refresh-token", user, "REFRESH")).thenReturn(true);
        when(jwtService.generateAccessToken(user)).thenReturn("new-access");
        when(jwtService.generateRefreshToken(user)).thenReturn("new-refresh");
        when(jwtService.extractExpiration("new-refresh")).thenReturn(Instant.now().plusSeconds(1000));
        when(jwtService.getAccessTokenExpirySeconds()).thenReturn(900L);
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        TokenResponse response = authService.refreshToken("refresh-token", "10.0.0.1", "device-1");

        assertEquals("new-access", response.getAccessToken());
        assertEquals("new-refresh", response.getRefreshToken());
        assertTrue(token.isRevoked());
        verify(refreshTokenRepository).save(token);
    }

    private User baseUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .name("User")
                .email("user@example.com")
                .passwordHash("encoded")
                .role(UserRole.STAFF)
                .active(true)
                .failedLoginAttempts(0)
                .accountLocked(false)
                .tokenVersion(0)
                .build();
    }

    private void setField(String name, Object value) throws Exception {
        Field field = AuthService.class.getDeclaredField(name);
        field.setAccessible(true);
        field.set(authService, value);
    }
}
