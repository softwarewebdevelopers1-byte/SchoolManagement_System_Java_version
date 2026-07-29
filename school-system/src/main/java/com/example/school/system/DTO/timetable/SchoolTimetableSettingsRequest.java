package com.example.school.system.DTO.timetable;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SchoolTimetableSettingsRequest(
        @NotNull UUID schoolId,
        @NotNull LocalTime schoolStartTime,
        @NotNull @Min(1) Integer lessonsPerDay,
        @NotNull @Min(1) Integer minutesPerLesson,
        @Valid List<SchoolBreakRequest> breaks) {
}
