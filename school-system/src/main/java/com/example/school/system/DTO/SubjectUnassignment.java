package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record SubjectUnassignment(@NotNull(message = "subject id missing") UUID subjectJointId,
        @NotNull(message = "teacher id is required") UUID teacherId) {

}
