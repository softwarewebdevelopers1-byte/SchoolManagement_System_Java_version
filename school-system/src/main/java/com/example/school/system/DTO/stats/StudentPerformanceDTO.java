package com.example.school.system.DTO.stats;

import java.util.UUID;

public record StudentPerformanceDTO(
        UUID studentId,
        String studentName,
        String admissionNo,
        String stream,
        Double totalMarks,
        Double points,
        Long scoredSubjects,
        Double average) {
}
