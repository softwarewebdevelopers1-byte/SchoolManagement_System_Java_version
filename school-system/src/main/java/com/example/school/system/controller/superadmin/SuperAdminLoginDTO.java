package com.example.school.system.controller.superadmin;

import jakarta.validation.constraints.NotBlank;

public record SuperAdminLoginDTO(
        @NotBlank(message = "Email is required") String email,
        @NotBlank(message = "Password is required") String password) {
}
