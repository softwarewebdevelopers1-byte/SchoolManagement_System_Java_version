package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordDTO(
        @NotBlank(message = "old password is required") String oldPassword,
        @NotBlank(message = "new password is required") String newPassword) {

}