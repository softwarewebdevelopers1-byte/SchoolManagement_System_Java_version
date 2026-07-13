package com.example.school.system.services;

import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.example.school.system.models.Users;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtCreationService {

    @Value("${jwt.secret}")
    private String secret;

    private final long expiration = TimeUnit.DAYS.toMillis(28);

    private SecretKey secretKeyBuilder(String key) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String GenerateToken(Users users) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + expiration);

        // Convert roles to Strings with "ROLE_" prefix
        List<String> rolesWithPrefix = users.getRoles().stream()
                .map(role -> "ROLE_" + role.name().toUpperCase()) // ← ADD THIS!
                .collect(Collectors.toList());

        return Jwts.builder()
                .subject(users.getEmail())
                .claim("roles", rolesWithPrefix) // Now has "ROLE_ADMIN", "ROLE_USER"
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(secretKeyBuilder(secret))
                .compact();
    }

    public Claims ValidateToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKeyBuilder(secret))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}