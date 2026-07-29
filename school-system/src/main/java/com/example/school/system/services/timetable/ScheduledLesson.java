package com.example.school.system.services.timetable;

public record ScheduledLesson(
        LessonBlock lessonBlock,
        GeneratedSlot firstSlot) {
}
