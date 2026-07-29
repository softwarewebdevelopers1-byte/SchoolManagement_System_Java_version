package com.example.school.system.services.timetable;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record TimetableGenerationResult(
        boolean success,
        List<ScheduledLesson> scheduledLessons,
        List<TimetableConflict> conflicts,
        long durationMs,
        int lessonsRequired,
        int lessonsGenerated,
        Map<UUID, Integer> teacherUtilization,
        Map<UUID, Integer> classUtilization,
        Map<UUID, Integer> subjectCoverage) {

    double completenessPercentage() {
        if (lessonsRequired == 0) {
            return 100.0;
        }
        return (lessonsGenerated * 100.0) / lessonsRequired;
    }
}
