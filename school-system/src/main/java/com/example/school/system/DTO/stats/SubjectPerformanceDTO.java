package com.example.school.system.DTO.stats;

import java.util.Map;

public record SubjectPerformanceDTO(
        java.util.UUID subjectId,
        String subjectName,
        double avgPercentage,
        double avgPoints,
        Map<String, Long> gradeDistribution) {
}
