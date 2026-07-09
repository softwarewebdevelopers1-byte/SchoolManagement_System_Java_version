package com.example.school.system.services;

import java.util.Date;
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
    @Value("${jwt.expiration}")
    private long expiration;

    private SecretKey secretKeyBuilder(String key) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String GenerateTeacherToken(Users teacher) {
        return Jwts.builder().subject(teacher.getEmail()).issuedAt(new Date())
                .signWith(secretKeyBuilder(secret))
                .compact();
    }

    public Claims ValidateTeacherToken(String token) {
        return Jwts.parser().verifyWith(secretKeyBuilder(secret)).build().parseSignedClaims(token).getPayload();
    }
    
}
