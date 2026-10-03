package com.example.school.system.DTO.archive;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.school.system.types.ArchiveStatus;

public record ArchiveRecordResponse(
        UUID id,
        String type,
        UUID classId,
        String className,
        String academicYear,
        Integer term,
        String examType,
        LocalDate startDate,
        LocalDate endDate,
        Integer version,
        ArchiveStatus status,
        Instant requestedAt,
        Instant verifiedAt,
        Long documentSize,
        boolean cleanupEligible,
        List<String> cleanupBlockers,
        String lastError) {
}
