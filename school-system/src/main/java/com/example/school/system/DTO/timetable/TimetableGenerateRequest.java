package com.example.school.system.DTO.timetable;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record TimetableGenerateRequest(
        @NotNull UUID schoolId,
        Boolean replaceExisting) {
}
