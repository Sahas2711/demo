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

        String email = sanitize(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserRole role = request.getRole() == null ? UserRole.STAFF : request.getRole();

        if (role != UserRole.STAFF && !isCurrentUserAdmin()) {
            throw new AccessDeniedException("Only ADMIN can assign elevated roles");
        }

        User user = User.builder()
                .name(sanitize(request.getName()))
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(true)
                .failedLoginAttempts(0)
                .accountLocked(false)
                .tokenVersion(0)
                .build();

        userRepository.save(user);

        auditLogService.log(AuditActionType.CREATE, "User",
                user.getId().toString(), user, null, "registered");

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
            auditLogService.log(AuditActionType.LOGIN, "User",
                    user.getId().toString(), user, null, "account-locked");
            throw new LockedException("Account locked");
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            registerFailedAttempt(user);

            auditLogService.log(AuditActionType.LOGIN, "User",
                    user.getId().toString(), user, null, "login-failed");

            throw ex;
        }

        resetFailedAttempts(user);

        auditLogService.log(AuditActionType.LOGIN, "User",
                user.getId().toString(), user, null, "login-success");

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

        // 🔥 REUSE DETECTION
        if (token.isRevoked()) {
            revokeAllUserTokens(user);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token reuse detected");
        }

        // ⏳ EXPIRY CHECK
        if (token.getExpiresAt().isBefore(Instant.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
        }

        // 🔐 DEVICE/IP CHECK (NULL SAFE)
        if (!safe(token.getIpAddress()).equals(currentIp) ||
            !safe(token.getDeviceId()).equals(deviceId)) {

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Device mismatch");
        }

        // 🔑 JWT VALIDATION
        if (!jwtService.isTokenValid(refreshTokenValue, user, "REFRESH")) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
        }

        // 🔄 ROTATE TOKEN
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
                .deviceId(safe(deviceId))
                .ipAddress(safe(ip))
                .userAgent(safe(userAgent))
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