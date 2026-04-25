package com.inventra.backend.security;

import com.inventra.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    @Value("${auth.jwt.secret}")
    private String jwtSecret;

    @Value("${auth.jwt.access-token-expiry-minutes:15}")
    private long accessTokenExpiryMinutes;

    @Value("${auth.jwt.refresh-token-expiry-days:7}")
    private long refreshTokenExpiryDays;

    // 🔐 ADD THESE IN application.properties
    @Value("${auth.jwt.issuer:inventra-backend}")
    private String issuer;

    @Value("${auth.jwt.audience:inventra-client}")
    private String audience;

    // ================= ACCESS TOKEN =================
    public String generateAccessToken(User user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId());
        claims.put("tokenVersion", user.getTokenVersion());
        claims.put("tokenType", "ACCESS");

        return buildToken(claims, user.getEmail(),
                Instant.now().plusSeconds(accessTokenExpiryMinutes * 60));
    }

    // ================= REFRESH TOKEN =================
    public String generateRefreshToken(User user) {

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("tokenVersion", user.getTokenVersion());
        claims.put("tokenType", "REFRESH");

        return buildToken(claims, user.getEmail(),
                Instant.now().plusSeconds(refreshTokenExpiryDays * 24 * 60 * 60));
    }

    // ================= EXTRACTION =================
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Instant extractExpiration(String token) {
        return extractAllClaims(token).getExpiration().toInstant();
    }

    public String extractTokenType(String token) {
        Object type = extractAllClaims(token).get("tokenType");
        return type == null ? "" : type.toString();
    }

    public Integer extractTokenVersion(String token) {
        Object version = extractAllClaims(token).get("tokenVersion");
        return version == null ? -1 : (Integer) version;
    }

    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("userId");
        return id == null ? null : Long.parseLong(id.toString());
    }

    // ================= VALIDATION =================
    public boolean isTokenValid(String token, User user, String expectedType) {

        Claims claims = extractAllClaims(token);

        // Basic checks
        if (!claims.getSubject().equals(user.getEmail())) return false;
        if (isTokenExpired(token)) return false;

        // Token type check
        if (!expectedType.equals(claims.get("tokenType"))) return false;

        // Token version check (🔥 critical)
        Integer tokenVersion = extractTokenVersion(token);
        if (tokenVersion == null || tokenVersion != user.getTokenVersion()) return false;

        // Issuer & Audience validation
        if (!issuer.equals(claims.getIssuer())) return false;
        if (!claims.getAudience().contains(audience)) return false;

        return true;
    }

    public boolean isTokenValid(String token, String expectedType) {

        Claims claims = extractAllClaims(token);

        if (isTokenExpired(token)) return false;
        if (!expectedType.equals(claims.get("tokenType"))) return false;
        if (!issuer.equals(claims.getIssuer())) return false;
        if (!claims.getAudience().contains(audience)) return false;

        return true;
    }

    // ================= TOKEN BUILDER =================
    private String buildToken(Map<String, Object> claims, String subject, Instant expiration) {

        Instant now = Instant.now();

        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuer(issuer)         // 🔥 NEW
                .audience().add(audience).and() // 🔥 NEW
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ================= HELPERS =================
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).isBefore(Instant.now());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .requireIssuer(issuer)     // 🔥 STRICT VALIDATION
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    // ================= EXPIRY =================
    public long getAccessTokenExpirySeconds() {
        return accessTokenExpiryMinutes * 60;
    }

    public long getRefreshTokenExpirySeconds() {
        return refreshTokenExpiryDays * 24 * 60 * 60;
    }
}