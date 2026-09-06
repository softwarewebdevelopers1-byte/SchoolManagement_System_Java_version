package com.example.school.system.DTO.stats;

import java.util.List;

public record TeacherSummaryStatsDTO(
        long total,
        long active,
        long onLeave,
        long suspended,
        List<SubjectCoverageDTO> subjectCoverage) {
}
