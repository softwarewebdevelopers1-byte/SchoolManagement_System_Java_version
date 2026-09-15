package com.example.school.system.DTO;

import java.time.Instant;
import java.util.UUID;

public record ResultAccessResponse(
        UUID accessId,
        UUID studentId,
        String token,
        String url,
        Instant expiresAt) {
}
