package com.example.school.system.services;

import java.util.Date;
import java.util.concurrent.TimeUnit;
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
    private long expiration = TimeUnit.DAYS.toMillis(28);
    private Date exipirationMill = new Date(System.currentTimeMillis() + expiration);

    private SecretKey secretKeyBuilder(String key) {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
    }

    public String GenerateToken(Users users) {
        return Jwts.builder().subject(users.getEmail()).claim("Roles", users.getRoles()).issuedAt(new Date())
                .expiration(exipirationMill)
                .signWith(secretKeyBuilder(secret))
                .compact();
    }

    public Claims ValidateToken(String token) {
        return Jwts.parser().verifyWith(secretKeyBuilder(secret)).build().parseSignedClaims(token).getPayload();
    }

}
