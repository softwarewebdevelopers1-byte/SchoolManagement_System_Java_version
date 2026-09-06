package com.example.school.system.DTO.attendanceInsights;

import java.time.LocalDate;
import java.util.UUID;

public record AttendanceDailyDTO(
        UUID studentId,
        String studentName,
        String admissionNo,
        String status,
        LocalDate date
) {
}
