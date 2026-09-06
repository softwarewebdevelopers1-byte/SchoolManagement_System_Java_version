package com.example.school.system.DTO.stats;

import java.util.List;
import java.util.Map;

public record GradeDistributionDTO(
        String grade,
        int totalStudents,
        List<SubjectGradeDistributionDTO> subjects,
        Map<String, Long> overallBandDistribution) {
}
