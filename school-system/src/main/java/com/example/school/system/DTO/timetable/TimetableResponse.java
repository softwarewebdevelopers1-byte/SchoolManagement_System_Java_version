package com.example.school.system.DTO.timetable;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.school.system.types.TimetableStatus;

public record TimetableResponse(
        UUID id,
        UUID schoolId,
        String academicYear,
        Integer term,
        TimetableStatus status,
        Instant generatedAt,
        List<TimetableEntryResponse> entries,
        TimetableReportResponse report) {
}
