package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubjectDTO(@NotBlank(message = "Subject should not be blank") String subjectName,
                @NotNull(message = "school id is required") UUID schoolId) {

}