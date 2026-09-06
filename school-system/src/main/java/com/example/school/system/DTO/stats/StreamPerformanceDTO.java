package com.example.school.system.DTO.stats;

public record StreamPerformanceDTO(
        String stream,
        double avgMarks,
        double avgAttendance,
        long studentCount) {
}
