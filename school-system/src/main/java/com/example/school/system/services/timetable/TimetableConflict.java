package com.example.school.system.services.timetable;

import java.time.DayOfWeek;
import java.util.UUID;

import com.example.school.system.types.TimetableConflictType;

public record TimetableConflict(
        TimetableConflictType type,
        String severity,
        String message,
        UUID classId,
        UUID teacherId,
        UUID subjectId,
        DayOfWeek dayOfWeek,
        Integer periodNumber) {

    public static TimetableConflict error(
            TimetableConflictType type,
            String message,
            UUID classId,
            UUID teacherId,
            UUID subjectId,
            DayOfWeek dayOfWeek,
            Integer periodNumber) {
        return new TimetableConflict(type, "ERROR", message, classId, teacherId, subjectId, dayOfWeek, periodNumber);
    }
}
