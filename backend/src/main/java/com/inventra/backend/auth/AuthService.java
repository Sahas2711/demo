package com.inventra.backend.auth;

import com.inventra.backend.dto.auth.LoginRequest;
import com.inventra.backend.dto.auth.RegisterRequest;
import com.inventra.backend.dto.auth.TokenResponse;
import com.inventra.backend.model.*;
import com.inventra.backend.repository.RefreshTokenRepository;
import com.inventra.backend.repository.UserRepository;
import com.inventra.backend.security.JwtService;
import com.inventra.backend.service.AuditLogService;
import com.inventra.backend.util.InputSanitizer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.Instant;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final InputSanitizer inputSanitizer;
    private final AuditLogService auditLogService;

    @Value("${auth.account.max-failed-attempts:5}")
    private int maxFailedAttempts;

    @Value("${auth.account.lock-duration-minutes:30}")
    private long lockDurationMinutes;

    // ================= REGISTER =================
    @Transactional
    public TokenResponse register(RegisterRequest request) {

        String email = inputSanitizer.sanitize(request.getEmail()).toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserRole role = request.getRole() == null ? UserRole.STAFF : request.getRole();

        if (role != UserRole.STAFF && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only ADMIN can assign elevated roles");
        }

        User user = User.builder()
                .name(inputSanitizer.sanitize(request.getName()))
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .failedLoginAttempts(0)
                .accountLocked(false)
                .tokenVersion(0)
                .build();

        userRepository.save(user);

        auditLogService.log(AuditActionType.CREATE, "User", user.getId().toString(), user, null, "registered");

        return issueTokenPair(user, request.getDeviceId(), request.getIp(), request.getUserAgent());
    }

    // ================= LOGIN =================
    @Transactional
    public TokenResponse login(LoginRequest request) {

        String email = inputSanitizer.sanitize(request.getEmail()).toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!user.isActive()) throw new DisabledException("Account inactive");

        if (isCurrentlyLocked(user)) {
            throw new LockedException("Account locked");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            registerFailedAttempt(user);
            throw ex;
        }

        resetFailedAttempts(user);

        auditLogService.log(AuditActionType.LOGIN, "User", user.getId().toString(), user, null, "login-success");

        return issueTokenPair(user, request.getDeviceId(), request.getIp(), request.getUserAgent());
    }

    // ================= REFRESH TOKEN =================
    @Transactional
    public TokenResponse refreshToken(String refreshTokenValue, String currentIp, String deviceId) {

        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }

        RefreshToken token = refreshTokenRepository
                .findByToken(refreshTokenValue)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token"));

        // 🔥 REUSE DETECTION
        if (token.isRevoked()) {
            revokeAllUserTokens(token.getUser());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token reuse detected");
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
        }

        // 🔐 DEVICE/IP CHECK
        if (!token.getIpAddress().equals(currentIp) || !token.getDeviceId().equals(deviceId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Device mismatch");
        }

        User user = token.getUser();

        if (!jwtService.isTokenValid(refreshTokenValue, user, "REFRESH")) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        // ROTATE TOKEN
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return issueTokenPair(user, deviceId, currentIp, token.getUserAgent());
    }

    // ================= LOGOUT =================
    @Transactional
    public void logout(String refreshTokenValue) {

        refreshTokenRepository.findByToken(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);

            auditLogService.log(
                    AuditActionType.LOGOUT,
                    "User",
                    token.getUser().getId().toString(),
                    token.getUser(),
                    null,
                    "logout"
            );
        });
    }

    // ================= CORE TOKEN LOGIC =================
    private TokenResponse issueTokenPair(User user, String deviceId, String ip, String userAgent) {

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .deviceId(deviceId)
                .ipAddress(ip)
                .userAgent(userAgent)
                .expiresAt(jwtService.extractExpiration(refreshTokenValue))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshToken);

        return TokenResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpirySeconds())
                .user(TokenResponse.UserSummary.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .name(user.getName())
                        .role(user.getRole())
                        .build())
                .build();
    }

    // ================= SECURITY HELPERS =================
    private void revokeAllUserTokens(User user) {
        refreshTokenRepository.revokeAllByUser(user.getId());
    }

    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getAuthorities().stream()
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

        user.setFailedLoginAttempts(0);
        user.setAccountLocked(false);
        user.setLockTime(null);

        userRepository.save(user);
    }
}