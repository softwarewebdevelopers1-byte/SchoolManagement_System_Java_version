package com.example.school.system.DTO.timetable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record TimetableReportResponse(
        Long generationDurationMs,
        Integer lessonsGenerated,
        Integer lessonsRequired,
        Integer conflictsDetected,
        Integer conflictsResolved,
        Integer remainingConflicts,
        Map<UUID, Integer> teacherUtilization,
        Map<UUID, Integer> classUtilization,
        Map<UUID, Integer> subjectCoverage,
        Double timetableCompletenessPercentage,
        List<TimetableConflictResponse> conflicts) {
}
