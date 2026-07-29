package com.example.school.system.DTO.timetable;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record TimetableEntryResponse(
        UUID id,
        UUID classId,
        String className,
        UUID subjectId,
        String subjectName,
        UUID teacherId,
        String teacherName,
        UUID subjectJointId,
        DayOfWeek dayOfWeek,
        Integer periodNumber,
        LocalTime startTime,
        LocalTime endTime,
        Integer doubleLessonPart,
        Boolean locked) {
}
