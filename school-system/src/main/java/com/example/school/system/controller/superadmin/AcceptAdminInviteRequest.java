package com.example.school.system.controller.superadmin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AcceptAdminInviteRequest(
        @NotBlank String token,
        @Email @NotBlank String email,
        @NotBlank String password) {
}
