package com.example.school.system.DTO.stats;

public record AtRiskStudentDTO(
        String studentId,
        String studentName,
        String admissionNo,
        double avgPercentage) {
}
