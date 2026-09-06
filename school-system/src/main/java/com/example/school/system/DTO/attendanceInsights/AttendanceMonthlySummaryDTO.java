package com.example.school.system.DTO.attendanceInsights;

import java.util.UUID;

public record AttendanceMonthlySummaryDTO(
        UUID studentId,
        String studentName,
        String admissionNo,
        long totalDays,
        long presentDays,
        long absentDays,
        double attendancePercentage
) {
}
