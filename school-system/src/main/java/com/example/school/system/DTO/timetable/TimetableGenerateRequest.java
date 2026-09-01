package com.example.school.system.DTO.timetable;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonAlias;

import jakarta.validation.constraints.NotNull;

public record TimetableGenerateRequest(
        @NotNull UUID schoolId,
        Boolean replaceExisting,
        LocalTime schoolStartTime,
        @JsonAlias({ "subjectsPerDay" }) Integer lessonsPerDay,
        @JsonAlias({ "subjectDurationMinutes" }) Integer minutesPerLesson,
        List<SchoolBreakRequest> breaks) {

    public TimetableGenerateRequest(UUID schoolId, Boolean replaceExisting) {
        this(schoolId, replaceExisting, null, null, null, List.of());
    }
}
