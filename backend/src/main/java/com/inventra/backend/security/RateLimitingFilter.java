package com.inventra.backend.security;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();
    private final long capacity;
    private final long refillTokens;
    private final long refillMinutes;

    public RateLimitingFilter(
            @Value("${app.rate-limit.capacity:120}") long capacity,
            @Value("${app.rate-limit.refill-tokens:120}") long refillTokens,
            @Value("${app.rate-limit.refill-minutes:1}") long refillMinutes
    ) {
        this.capacity = capacity;
        this.refillTokens = refillTokens;
        this.refillMinutes = refillMinutes;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String key = getClientIp(request);
        Bucket bucket = buckets.computeIfAbsent(key, k -> newBucket());
        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType("application/json");
        response.getWriter().write("{\"timestamp\":\"" + java.time.Instant.now() + "\",\"status\":429,\"message\":\"Rate limit exceeded\",\"path\":\"" + request.getRequestURI() + "\"}");
    }

    private Bucket newBucket() {
        Bandwidth limit = Bandwidth.classic(capacity, Refill.intervally(refillTokens, Duration.ofMinutes(refillMinutes)));
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
