package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TeacherAddProfile(
        @NotBlank(message = "first name must not be blank") String firstName,
        @NotBlank(message = "last name must not be blank") String lastName,@NotNull(message = "teacher profile id is missing") UUID profileId) {

}
