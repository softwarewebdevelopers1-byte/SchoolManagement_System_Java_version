package com.example.school.system.DTO.stats;

import java.util.Map;

public record SubjectGradeDistributionDTO(
        String subjectId,
        String subjectName,
        double avgPercentage,
        double avgPoints,
        int studentCount,
        Map<String, Long> gradeDistribution) {
}
