package com.example.school.system.controller.admin.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignUpDTO(@Email(message = "invalid email format") @NotBlank(message = "email is required") String email,
        @NotBlank(message = "password should not be empty") String password) {
            
}
