package com.example.school.system.DTO;

import java.time.Instant;
import java.util.UUID;

import com.example.school.system.types.ExamType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ResultPublicationRequest(
        @NotNull UUID classId,
        @NotBlank String academicYear,
        @NotNull Integer term,
        @NotNull ExamType examType,
        Instant expiresAt) {
}
