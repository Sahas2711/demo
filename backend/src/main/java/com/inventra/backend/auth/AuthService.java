package com.inventra.backend.auth;

import org.springframework.web.server.ResponseStatusException;

import com.inventra.backend.dto.auth.LoginRequest;
import com.inventra.backend.dto.auth.RegisterRequest;
import com.inventra.backend.dto.auth.TokenResponse;
import com.inventra.backend.model.AuditActionType;
import com.inventra.backend.model.User;
import com.inventra.backend.model.UserRole;
import com.inventra.backend.repository.RefreshTokenRepository;
import com.inventra.backend.repository.UserRepository;
import com.inventra.backend.security.JwtService;
import com.inventra.backend.service.AuditLogService;
import com.inventra.backend.util.InputSanitizer;

import org.springframework.security.access.AccessDeniedException;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.inventra.backend.model.RefreshToken;

import java.time.Duration;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final InputSanitizer inputSanitizer;
    private final AuditLogService auditLogService;

    @org.springframework.beans.factory.annotation.Value("${auth.account.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @org.springframework.beans.factory.annotation.Value("${auth.account.lock-duration-minutes:30}")
    private long lockDurationMinutes;

    // ================= REGISTER =================
    @Transactional
    public TokenResponse register(RegisterRequest request) {

        String email = sanitize(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserRole role = request.getRole() == null ? UserRole.STAFF : request.getRole();

        if (role != UserRole.STAFF && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only ADMIN can assign elevated roles");
        }

        User user = new User();
        user.setName(sanitize(request.getName()));
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setActive(true);
        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setTokenVersion(0);

        userRepository.save(user);

        try {
            auditLogService.log(AuditActionType.CREATE, "User",
                    user.getId().toString(), user, null, "\"registered\"");
        } catch (Exception ignored) {}

        return issueTokenPair(user,
                safe(request.getDeviceId()),
                safe(request.getIp()),
                safe(request.getUserAgent()));
    }

    // ================= LOGIN =================
    @Transactional
    public TokenResponse login(LoginRequest request) {

        String email = sanitize(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) throw new DisabledException("Account inactive");

        if (isCurrentlyLocked(user)) {
            try {
                auditLogService.log(AuditActionType.LOGIN, "User",
                        user.getId().toString(), user, null, "\"account-locked\"");
            } catch (Exception ignored) {}
            throw new LockedException("Account locked");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            registerFailedAttempt(user);

            try {
                auditLogService.log(AuditActionType.LOGIN, "User",
                        user.getId().toString(), user, null, "\"login-failed\"");
            } catch (Exception ignored) {}

            throw ex;
        }

        resetFailedAttempts(user);

        try {
            auditLogService.log(AuditActionType.LOGIN, "User",
                    user.getId().toString(), user, null, "\"login-success\"");
        } catch (Exception ignored) {}

        return issueTokenPair(user,
                safe(request.getDeviceId()),
                safe(request.getIp()),
                safe(request.getUserAgent()));
    }

    // ================= REFRESH TOKEN =================
    @Transactional
    public TokenResponse refreshToken(String refreshTokenValue, String currentIp, String deviceId) {

        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }

        currentIp = safe(currentIp);
        deviceId = safe(deviceId);

        RefreshToken token = refreshTokenRepository
                .findByToken(refreshTokenValue)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));

        User user = token.getUser();

        if (token.isRevoked()) {
            revokeAllUserTokens(user);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token reuse detected");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
        }

        if (!safe(token.getIpAddress()).equals(currentIp) ||
            !safe(token.getDeviceId()).equals(deviceId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Device mismatch");
        }

        if (!jwtService.isTokenValid(refreshTokenValue, user, "REFRESH")) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return issueTokenPair(user, deviceId, currentIp, safe(token.getUserAgent()));
    }

    // ================= LOGOUT =================
    @Transactional
    public void logout(String refreshTokenValue) {

        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);

            try {
                auditLogService.log(
                        AuditActionType.LOGOUT,
                        "User",
                        token.getUser().getId().toString(),
                        token.getUser(),
                        null,
                        "\"logout\""
                );
            } catch (Exception ignored) {}
        });
    }

    // ================= CORE TOKEN LOGIC =================
    private TokenResponse issueTokenPair(User user, String deviceId, String ip, String userAgent) {

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenValue);
        refreshToken.setUser(user);
        refreshToken.setDeviceId(safe(deviceId));
        refreshToken.setIpAddress(safe(ip));
        refreshToken.setUserAgent(safe(userAgent));
        refreshToken.setExpiresAt(jwtService.extractExpiration(refreshTokenValue));
        refreshToken.setRevoked(false);

        refreshTokenRepository.save(refreshToken);

        TokenResponse.UserSummary userSummary = new TokenResponse.UserSummary();
        userSummary.setId(user.getId());
        userSummary.setEmail(user.getEmail());
        userSummary.setName(user.getName());
        userSummary.setRole(user.getRole());

        TokenResponse response = new TokenResponse();
        response.setAccessToken(accessToken);
        response.setRefreshToken(refreshTokenValue);
        response.setTokenType("Bearer");
        response.setExpiresIn(jwtService.getAccessTokenExpirySeconds());
        response.setUser(userSummary);
        return response;
    }

    // ================= HELPERS =================

    private String sanitize(String input) {
        return inputSanitizer.sanitize(input).toLowerCase();
    }

    private String safe(String input) {
        return (input == null || input.isBlank()) ? "unknown" : input;
    }

    private void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user.getId());
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() &&
                auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private boolean isCurrentlyLocked(User user) {

        if (!user.isAccountLocked()) return false;

        Instant unlockTime = user.getLockTime().plus(Duration.ofMinutes(lockDurationMinutes));

        if (Instant.now().isAfter(unlockTime)) {
            user.setAccountLocked(false);
            user.setFailedLoginAttempts(0);
            user.setLockTime(null);
            userRepository.save(user);
            return false;
        }

        return true;
    }

    private void registerFailedAttempt(User user) {

        int attempts = user.getFailedLoginAttempts() + 1;

        user.setFailedLoginAttempts(attempts);

        if (attempts >= maxFailedAttempts) {
            user.setAccountLocked(true);
            user.setLockTime(Instant.now());
        }

        userRepository.save(user);
    }

    private void resetFailedAttempts(User user) {

        if (user.getFailedLoginAttempts() == 0 && !user.isAccountLocked()) return;

        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setLockTime(null);

        userRepository.save(user);
    }
}
