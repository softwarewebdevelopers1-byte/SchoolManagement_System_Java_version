package com.example.school.system.security.jwt;

import org.springframework.stereotype.Component;

import com.example.school.system.error.jwt.JwtNotMatchingExceptionHandler;

import io.jsonwebtoken.JwtException;

@Component
public class JwtValidation {
    private JwtService jwtService;

    public JwtValidation(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    public void validateTokenIssued(String token) {
        String jwtError = "Unauthorized token";
        try {
            if (!token.startsWith("Bearer") || token == null) {
                throw new JwtNotMatchingExceptionHandler(jwtError);
            }
            String authHeader = token.substring(7);
            jwtService.ValidateToken(authHeader);
        } catch (JwtException e) {
            throw new JwtNotMatchingExceptionHandler(jwtError);
        }
    }
}
