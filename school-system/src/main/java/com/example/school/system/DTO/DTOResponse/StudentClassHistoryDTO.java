package com.example.school.system.DTO.DTOResponse;

import java.time.Instant;
import java.util.UUID;

import lombok.Builder;

@Builder
public record StudentClassHistoryDTO(
        UUID studentId,
        String studentName,
        String admissionNumber,
        UUID classId,
        Integer classGrade,
        String classStream,
        String academicYear,
        Instant recordedAt) {
}
