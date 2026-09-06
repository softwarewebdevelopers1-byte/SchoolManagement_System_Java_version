package com.example.school.system.DTO.stats;

import java.util.List;

public record AtRiskSummaryDTO(
        double threshold,
        long totalStudents,
        long atRiskCount,
        long highPerformingCount,
        List<AtRiskStudentDTO> atRiskStudents,
        List<AtRiskStudentDTO> highPerformingStudents) {
}
