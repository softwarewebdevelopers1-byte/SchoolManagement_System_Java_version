package com.example.school.system.DTO.stats;

import java.util.Map;

public record ClassAnalyticsDTO(
        java.util.UUID subjectId,
        String subjectName,
        double avgPercentage,
        double avgPoints,
        long studentCount,
        Map<String, Long> gradeDistribution) {
}
