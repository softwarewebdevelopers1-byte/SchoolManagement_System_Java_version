package com.example.school.system.DTO.DTOResponse;

import java.time.LocalDate;
import java.util.List;

public record DashboardSummary(
        List<String> roles,
        long studentCount,
        long teacherCount,
        long classCount,
        long subjectCount,
        long attendanceSheetsToday,
        boolean hasActiveTimetable,
        LocalDate date) {
}
