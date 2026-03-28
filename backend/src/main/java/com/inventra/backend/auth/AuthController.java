@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${auth.cookie.same-site:Strict}")
    private String sameSite;

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@Valid @RequestBody RegisterRequest request) {
        TokenResponse response = authService.register(request);
        return withAuthCookies(response);
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@Valid @RequestBody LoginRequest request) {
        TokenResponse response = authService.login(request);
        return withAuthCookies(response);
    }

    // ================= REFRESH =================
    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenCookie,
            @RequestHeader(name = "X-Refresh-Token", required = false) String refreshTokenHeader,
            @RequestHeader(value = "User-Agent", required = false) String userAgent,
            @RequestHeader(value = "X-Forwarded-For", required = false) String ip
    ) {
        String refreshToken = extractToken(refreshTokenCookie, refreshTokenHeader);

        if (refreshToken == null) {
            throw new IllegalArgumentException("Refresh token missing");
        }

        TokenResponse response = authService.refreshToken(
                refreshToken,
                safe(ip),
                "unknown-device" // since you didn’t pass deviceId earlier
        );

        return withAuthCookies(response);
    }

    // ================= LOGOUT =================
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @CookieValue(name = "refresh_token", required = false) String refreshTokenCookie,
            @RequestHeader(name = "X-Refresh-Token", required = false) String refreshTokenHeader
    ) {
        String refreshToken = extractToken(refreshTokenCookie, refreshTokenHeader);

        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie("access_token", "/"))
                .header(HttpHeaders.SET_COOKIE, clearCookie("refresh_token", "/api/v1/auth"))
                .body(MessageResponse.builder().message("Logged out successfully").build());
    }

    // ================= COOKIE HANDLING =================
    private ResponseEntity<TokenResponse> withAuthCookies(TokenResponse response) {

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE,
                        buildCookie("access_token",
                                response.getAccessToken(),
                                Duration.ofSeconds(response.getExpiresIn())))
                .header(HttpHeaders.SET_COOKIE,
                        buildCookie("refresh_token",
                                response.getRefreshToken(),
                                Duration.ofDays(7)))
                .body(response);
    }

    private String buildCookie(String name, String value, Duration maxAge) {
        return ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(validateSameSite())
                .path(name.equals("access_token") ? "/" : "/api/v1/auth")
                .maxAge(maxAge)
                .build()
                .toString();
    }

    private String clearCookie(String name, String path) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(validateSameSite())
                .path(path)
                .maxAge(Duration.ZERO)
                .build()
                .toString();
    }

    // ================= HELPERS =================
    private String extractToken(String cookie, String header) {
        if (cookie != null && !cookie.isBlank()) return cookie;
        if (header != null && !header.isBlank()) return header;
        return null;
    }

    private String validateSameSite() {
        return switch (sameSite.toLowerCase()) {
            case "lax" -> "Lax";
            case "none" -> "None";
            default -> "Strict";
        };
    }

    private String safe(String input) {
        return (input == null || input.isBlank()) ? "unknown" : input;
    }
}