package com.example.school.system.DTO.stats;

import java.util.List;

public record SchoolOverviewStatsDTO(
        long totalStudents,
        long totalStaff,
        long totalClasses,
        double avgAttendanceRate,
        List<StreamPerformanceDTO> streamPerformance,
        List<SubjectPerformanceDTO> subjectPerformance) {
}
