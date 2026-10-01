package com.example.school.system.services;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Base64;
import java.util.Set;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import com.example.school.system.types.UserRoles;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class JwtCreationServiceTest {
    @Test
    void validatesSecretAndSignsSuperAdminToken() {
        byte[] secretBytes = new byte[32];
        String secret = Base64.getEncoder().encodeToString(secretBytes);
        JwtCreationService service = new JwtCreationService();
        ReflectionTestUtils.setField(service, "secret", secret);

        service.validateSecret();
        String token = service.GenerateSuperAdminToken(UUID.randomUUID(), Set.of(UserRoles.SUPERADMIN));

        SecretKey key = Keys.hmacShaKeyFor(secretBytes);
        Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        assertEquals("SUPERADMIN", claims.get("scope"));
        assertEquals(1, claims.get("roles", java.util.List.class).size());
    }
}
