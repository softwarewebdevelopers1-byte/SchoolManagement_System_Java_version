package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterStudentsToSubjectDTO(@NotNull(message = "student id is required") UUID studentId,
        @NotNull(message = "subject joint id is required") UUID subjectJoint,
        @NotNull(message = "school id is required") UUID schoolId,
        @NotBlank(message = "elective code is required") String electiveCode) {

}
