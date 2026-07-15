package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateSchoolDTO(@NotBlank(message = "school name should not be blank") String schoolName,
                @Email @NotBlank(message = "email is required") String schoolEmail,
                @NotBlank(message = "address should not be empty") String schoolAddress,
                @NotBlank(message = "phone number should not be blank") String phoneNumber, String motto) {
}
