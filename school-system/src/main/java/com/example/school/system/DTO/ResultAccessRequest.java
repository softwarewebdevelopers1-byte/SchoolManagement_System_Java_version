package com.example.school.system.DTO;

import java.time.Instant;
import java.util.UUID;

import com.example.school.system.types.ExamType;

import jakarta.validation.constraints.NotNull;

public record ResultAccessRequest(
        @NotNull UUID studentId,
        @NotNull String academicYear,
        @NotNull Integer term,
        @NotNull ExamType examType,
        Instant expiresAt) {
}
