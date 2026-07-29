package com.example.school.system.DTO.timetable;

import java.time.DayOfWeek;
import java.util.UUID;

import com.example.school.system.types.TimetableConflictType;

public record TimetableConflictResponse(
        TimetableConflictType type,
        String severity,
        String message,
        UUID classId,
        UUID teacherId,
        UUID subjectId,
        DayOfWeek dayOfWeek,
        Integer periodNumber) {
}
