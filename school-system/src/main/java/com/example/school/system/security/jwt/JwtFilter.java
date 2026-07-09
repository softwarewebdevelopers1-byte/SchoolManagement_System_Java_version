package com.example.school.system.security.jwt;

import org.springframework.stereotype.Component;

import com.example.school.system.error.jwt.JwtNotMatchingExceptionHandler;
import com.example.school.system.services.JwtCreationService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

@Component
public class JwtFilter {
    private JwtCreationService jwtService;

    public JwtFilter(JwtCreationService jwtService) {
        this.jwtService = jwtService;
    }

    public Claims validateTokenIssued(String token) {
        String jwtError = "Unauthorized token";
        try {
            if (!token.startsWith("Bearer") || token == null) {
                throw new JwtNotMatchingExceptionHandler(jwtError);
            }
            String authHeader = token.substring(7);
            return jwtService.ValidateTeacherToken(authHeader);
        } catch (JwtException e) {
            throw new JwtNotMatchingExceptionHandler(jwtError);
        }
    }
}
