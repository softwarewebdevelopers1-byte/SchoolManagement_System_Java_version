package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record OtpValidationDTO(@NotBlank(message = "email field cannot be empty") String email,
        @NotBlank(message = "otp value cannot be empty") String value) {
}
