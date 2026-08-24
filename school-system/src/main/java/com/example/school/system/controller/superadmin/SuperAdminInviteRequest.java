package com.example.school.system.controller.superadmin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SuperAdminInviteRequest(
        @Email @NotBlank String email,
        @NotNull UUID schoolId) {
}
