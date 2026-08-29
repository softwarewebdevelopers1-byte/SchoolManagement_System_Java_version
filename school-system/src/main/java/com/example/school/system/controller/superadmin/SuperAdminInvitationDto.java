package com.example.school.system.controller.superadmin;

import java.time.LocalDateTime;
import java.util.UUID;

public record SuperAdminInvitationDto(
        UUID id,
        String email,
        UUID schoolId,
        String schoolName,
        String role,
        String invitationStatus,
        String link,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        LocalDateTime usedAt,
        boolean used,
        boolean revoked,
        boolean expired) {
}
