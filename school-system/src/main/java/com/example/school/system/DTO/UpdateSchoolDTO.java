package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record UpdateSchoolDTO(String schoolName,
        @Email String schoolEmail,
        String schoolAddress,
        String phoneNumber, String motto, @NotNull(message = "school id must be provided") UUID schoolId) {
}
