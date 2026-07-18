package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record OtpValidationDTO(@NotBlank(message = "email field cannot be empty") String email,
                @NotBlank(message = "otp value cannot be empty") String value,
                @NotNull(message = "school id is missing") UUID schoolId) {
}
