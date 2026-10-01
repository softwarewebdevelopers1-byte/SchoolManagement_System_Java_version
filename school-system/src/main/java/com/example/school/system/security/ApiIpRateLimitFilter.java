package com.example.school.system.security;

import java.io.IOException;
import java.time.Duration;

import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class ApiIpRateLimitFilter extends OncePerRequestFilter {
    private final ApiRateLimitService rateLimitService;

    public ApiIpRateLimitFilter(ApiRateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return "OPTIONS".equalsIgnoreCase(request.getMethod())
                || !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        ApiRateLimitService.Decision decision = rateLimitService.consume(
                "api-global-ip",
                rateLimitService.clientAddress(request),
                600,
                Duration.ofMinutes(1));

        if (!decision.allowed()) {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setHeader("Retry-After", Long.toString(decision.retryAfterSeconds()));
            response.getWriter().write(
                    "{\"status\":\"Error\",\"message\":\"Too many requests. Please retry later.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
