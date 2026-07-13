package com.example.school.system.security.jwt;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.school.system.services.CustomUserDetailsService;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final CustomUserDetailsService userDetailsService;
    private final JwtValidator jwtValidator;

    public JwtFilter(JwtValidator jwtValidator, CustomUserDetailsService customUserDetailsService) {
        this.jwtValidator = jwtValidator;
        this.userDetailsService = customUserDetailsService;
    }

    // 1. Skip public endpoints
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        // Allow OPTIONS requests (CORS preflight)
        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // Allow public endpoints

        if (path.startsWith("/api/auth"))
            return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // 2. If no token, continue without authentication
        if (authHeader == null || authHeader.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 3. Validate token only if present
            Claims userToken = jwtValidator.validateTokenIssued(authHeader);

            if (userToken != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String userEmail = userToken.getSubject();
                UserDetails user = userDetailsService.loadUserByUsername(userEmail);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        user.getAuthorities());

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            // 4. Log error but continue (don't block requests)
            System.err.println("JWT validation error: " + e.getMessage());
            filterChain.doFilter(request, response);
        }
    }
}