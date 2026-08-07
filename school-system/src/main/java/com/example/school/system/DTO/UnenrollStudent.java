package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UnenrollStudent(
        @NotBlank(message = "enrollment code is required") String enrollmentCode,
        @NotNull(message = "student id cannot be null") UUID studentId) {

}
