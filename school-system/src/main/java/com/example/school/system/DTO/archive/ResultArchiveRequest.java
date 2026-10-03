package com.example.school.system.DTO.archive;

import java.util.UUID;

import com.example.school.system.types.ExamType;

import jakarta.validation.constraints.NotNull;

public record ResultArchiveRequest(
        @NotNull UUID classId,
        @NotNull String academicYear,
        @NotNull Integer term,
        @NotNull ExamType examType) {
}
