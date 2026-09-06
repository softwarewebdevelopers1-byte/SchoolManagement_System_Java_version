package com.example.school.system.DTO.attendanceInsights;

import java.util.UUID;

public record AttendanceTermlySummaryDTO(
        UUID studentId,
        String studentName,
        String admissionNo,
        long totalSessions,
        long presentSessions,
        double attendancePercentage
) {
}
