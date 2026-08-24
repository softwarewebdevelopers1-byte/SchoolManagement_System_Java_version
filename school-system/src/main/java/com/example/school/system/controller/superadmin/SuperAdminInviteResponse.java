package com.example.school.system.controller.superadmin;

import java.time.LocalDateTime;
import java.util.UUID;

public record SuperAdminInviteResponse(
        UUID id,
        String email,
        UUID schoolId,
        String schoolName,
        String token,
        LocalDateTime expiresAt,
        boolean used) {
}
