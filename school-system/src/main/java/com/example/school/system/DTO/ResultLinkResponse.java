package com.example.school.system.DTO;

import java.time.Instant;
import java.util.UUID;

public record ResultLinkResponse(
        UUID accessId,
        UUID studentId,
        String studentName,
        String admissionNumber,
        String className,
        String academicYear,
        Integer term,
        String examType,
        String status,
        String resultsUrl,
        Instant createdAt,
        Instant expiresAt,
        Instant renewedAt) {
}
