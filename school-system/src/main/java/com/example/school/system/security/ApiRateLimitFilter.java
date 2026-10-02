package com.example.school.system.security;

import java.io.IOException;
import java.time.Duration;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class ApiRateLimitFilter extends OncePerRequestFilter {
    private static final Duration MINUTE = Duration.ofMinutes(1);
    private static final Duration TEN_MINUTES = Duration.ofMinutes(10);
    private static final Duration HOUR = Duration.ofHours(1);

    private final ApiRateLimitService rateLimitService;

    public ApiRateLimitFilter(ApiRateLimitService rateLimitService) {
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
        ApiRateLimitService.Decision decision = checkLimit(request);
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

    private ApiRateLimitService.Decision checkLimit(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientAddress = rateLimitService.clientAddress(request);

        if (isLogin(path)) {
            if (path.equals("/api/superadmin/login")) {
                return rateLimitService.consume("superadmin-login-ip", clientAddress, 5, TEN_MINUTES);
            }
            return rateLimitService.consume("login-ip", clientAddress, 20, MINUTE);
        }

        if (isTeacherOnboarding(path, method)) {
            return rateLimitService.consume("teacher-onboarding-ip", clientAddress, 10, TEN_MINUTES);
        }

        if (isPublicOnboarding(path, method)) {
            return rateLimitService.consume("public-onboarding-ip:" + path, clientAddress, 5, TEN_MINUTES);
        }

        if (path.startsWith("/api/superadmin/invites/")) {
            ApiRateLimitService.Decision ipDecision =
                    rateLimitService.consume("invite-ip", clientAddress, 30, MINUTE);
            if (!ipDecision.allowed()) {
                return ipDecision;
            }
            if ("GET".equalsIgnoreCase(method)) {
                String inviteToken = path.substring("/api/superadmin/invites/".length());
                return rateLimitService.consume("invite-token", inviteToken, 30, HOUR);
            }
        }

        if (path.startsWith("/api/public/results/")) {
            ApiRateLimitService.Decision ipDecision =
                    rateLimitService.consume("public-results-ip", clientAddress, 30, MINUTE);
            if (!ipDecision.allowed()) {
                return ipDecision;
            }
            String token = path.substring("/api/public/results/".length());
            return rateLimitService.consume("public-results-token", token, 60, HOUR);
        }

        if (isSensitiveRead(path, method)) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                return rateLimitService.consume(
                        "sensitive-read-user",
                        authentication.getName(),
                        180,
                        MINUTE);
            }
            return rateLimitService.consume("sensitive-read-ip", clientAddress, 60, MINUTE);
        }

        if (path.startsWith("/api/public/")
                || path.startsWith("/api/schools/public/")
                || path.equals("/api/schools/get/school/for/user")) {
            return rateLimitService.consume("public-read-ip:" + path, clientAddress, 60, MINUTE);
        }

        return new ApiRateLimitService.Decision(true, 0);
    }

    private static boolean isLogin(String path) {
        return path.equals("/api/login")
                || path.startsWith("/api/login/")
                || path.equals("/api/superadmin/login");
    }

    private static boolean isPublicOnboarding(String path, String method) {
        return "POST".equalsIgnoreCase(method)
                && path.equals("/api/schools/create-school");
    }

    private static boolean isTeacherOnboarding(String path, String method) {
        return ("GET".equalsIgnoreCase(method) && path.equals("/api/schools/get/school/for/user"))
                || ("POST".equalsIgnoreCase(method) && path.equals("/api/auth/teacher/create-account"));
    }

    private static boolean isSensitiveRead(String path, String method) {
        return "GET".equalsIgnoreCase(method)
                && (path.startsWith("/api/get/")
                        || path.equals("/api/users")
                        || path.equals("/api/users/"));
    }
}
