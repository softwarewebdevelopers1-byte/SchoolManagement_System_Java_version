package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AssignSubjectTeacherDTO(@NotNull(message = "class id is required") UUID classId,
        @NotNull(message = "subject joint is required") UUID subjectJointId,
        @NotNull(message = "teacher id is required") UUID teacherId) {

}
