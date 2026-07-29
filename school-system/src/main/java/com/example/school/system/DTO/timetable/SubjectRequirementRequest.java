package com.example.school.system.DTO.timetable;

import java.util.UUID;

import com.example.school.system.types.SubjectTimePreference;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SubjectRequirementRequest(
        @NotNull UUID schoolId,
        @NotNull UUID classId,
        @NotNull UUID subjectJointId,
        @NotNull @Min(1) Integer weeklyLessons,
        Boolean requiresDoubleLesson,
        SubjectTimePreference timePreference) {
}
