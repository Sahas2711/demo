package com.inventra.backend.auth;

import com.inventra.backend.dto.auth.LoginRequest;
import com.inventra.backend.dto.auth.RegisterRequest;
import com.inventra.backend.dto.auth.TokenResponse;
import com.inventra.backend.model.RefreshToken;
import com.inventra.backend.model.AuditActionType;
import com.inventra.backend.model.User;
import com.inventra.backend.model.UserRole;
import com.inventra.backend.repository.RefreshTokenRepository;
import com.inventra.backend.repository.UserRepository;
import com.inventra.backend.security.JwtService;
import com.inventra.backend.service.AuditLogService;
import com.inventra.backend.util.InputSanitizer;
import java.time.Duration;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    @Transactional
    public TokenResponse register(RegisterRequest request) {
        String email = inputSanitizer.sanitize(request.getEmail()).toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserRole targetRole = request.getRole() == null ? UserRole.STAFF : request.getRole();
        if (targetRole != UserRole.STAFF && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only ADMIN can assign ADMIN or VIEWER roles");
        }

        User user = User.builder()
                .name(inputSanitizer.sanitize(request.getName()))
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(targetRole)
                .active(true)
                .failedLoginAttempts(0)
                .accountLocked(false)
                .build();

        User saved = userRepository.save(user);
        auditLogService.log(AuditActionType.CREATE, "User", saved.getId().toString(), saved, null, "registered");
        log.info("User registered: email={}, role={}", saved.getEmail(), saved.getRole());
        return issueTokenPair(saved);
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        String email = inputSanitizer.sanitize(request.getEmail()).toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!user.isActive()) {
            throw new DisabledException("Account is inactive");
        }

        if (isCurrentlyLocked(user)) {
            throw new LockedException("Account is temporarily locked due to failed login attempts");
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
        log.info("Login success: userId={}", user.getId());
        return issueTokenPair(user);
    }

    @Transactional
    public TokenResponse refreshToken(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is required");
        }

        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token"));

        if (storedToken.getExpiresAt().isBefore(Instant.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token expired");
        }

        User user = storedToken.getUser();
        if (!jwtService.isTokenValid(refreshTokenValue, user, "REFRESH")) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
        log.info("Refresh token rotated: userId={}", user.getId());

        return issueTokenPair(user);
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        if (refreshTokenValue == null || refreshTokenValue.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenAndRevokedFalse(refreshTokenValue).ifPresent(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            auditLogService.log(
                    AuditActionType.LOGOUT,
                    "User",
                    token.getUser().getId().toString(),
                    token.getUser(),
                    null,
                    "logout-success"
            );
            log.info("Logout success: userId={}", token.getUser().getId());
        });
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private boolean isCurrentlyLocked(User user) {
        if (!user.isAccountLocked()) {
            return false;
        }

        Instant lockTime = user.getLockTime();
        if (lockTime == null) {
            return true;
        }

        Instant unlockAt = lockTime.plus(Duration.ofMinutes(lockDurationMinutes));
        if (Instant.now().isAfter(unlockAt)) {
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

    private TokenResponse issueTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
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
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build())
                .build();
    }
}
