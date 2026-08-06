package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;

public record RegMultipleStudentsToSubjectJoint(
                @NotNull(message = "atleast one student is required") List<UUID> studentsId,
                @NotNull(message = "subject joint id is required") UUID subjectId,
                @NotNull(message = "school id is required") UUID schoolId,
                @NotBlank(message = "elective code is required") String electiveCode) {

}
