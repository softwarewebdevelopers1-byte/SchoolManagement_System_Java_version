package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UserProfileDTO(
        @Email String email,
        @NotBlank(message = "password is missing") String password) {
}
