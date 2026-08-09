package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.types.Gender;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterStudentDTO(
                @Email(message = "Invalid email format") String email,

                @NotBlank(message = "Student full name is required") String studentFullName,

                String studentAdm,

                String phoneNumber,
                Gender gender,
                @NotNull(message = "class is required") UUID classId,
                @NotNull(message = "school id is required") UUID schoolId) {
}