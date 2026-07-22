package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record RegisterSubjectJoint(@NotNull(message = "class id is required") UUID classId,
        @NotNull(message = "subject id is required") UUID subjectId) {

}
