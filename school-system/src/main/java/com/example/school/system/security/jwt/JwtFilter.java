package com.example.school.system.security.jwt;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equalsIgnoreCase(method)) {
            return true;
        }

        // ✅ Better to specify exact endpoints
        if (path.startsWith("/api/auth/login"))
            return true;
        if (path.startsWith("/api/auth/register"))
            return true;
        if (path.startsWith("/api/public"))
            return true;
        if (path.startsWith("/actuator"))
            return true;

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || authHeader.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // ✅ Validate token and get claims
            Claims claims = jwtValidator.validateTokenIssued(authHeader);

            if (claims != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                String userEmail = claims.getSubject();

                // ✅ Extract roles from claims (they already have "ROLE_" prefix)
                @SuppressWarnings("unchecked")
                List<String> roles = claims.get("roles", List.class);
                System.out.println(roles);
                // ✅ Convert to Spring Security authorities
                Collection<GrantedAuthority> authorities = roles.stream()
                        .map(role -> new SimpleGrantedAuthority(role)) // ✅ Already has "ROLE_"
                        .collect(Collectors.toList());

                // ✅ Create authentication with authorities from JWT
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userEmail,
                        null,
                        authorities // ✅ Use authorities from JWT
                );

                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }

            filterChain.doFilter(request, response);

        } catch (Exception e) {
            System.err.println("JWT validation error: " + e.getMessage());
            filterChain.doFilter(request, response);
        }
    }
}