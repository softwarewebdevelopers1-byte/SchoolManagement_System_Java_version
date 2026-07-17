package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ResetPasswordEmailerDto(@Email @NotBlank(message = "email field is required") String email) {

}
