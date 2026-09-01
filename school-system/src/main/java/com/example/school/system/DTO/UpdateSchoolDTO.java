package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.types.SchoolVisibility;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record UpdateSchoolDTO(String schoolName,
        @Email String schoolEmail,
        String schoolAddress,
        String phoneNumber, String motto, SchoolVisibility visibility,
        @NotNull(message = "school id must be provided") UUID schoolId) {
}
