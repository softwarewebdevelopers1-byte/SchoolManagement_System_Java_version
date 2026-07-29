package com.example.school.system.services.timetable;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record GeneratedSlot(
        DayOfWeek dayOfWeek,
        Integer periodNumber,
        LocalTime startTime,
        LocalTime endTime) {
}
