package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SignUpUserDTO(
        @Email @NotBlank(message = "email field is missing") String email,
        @NotBlank(message = "password is missing") String password,
        @NotBlank(message = "School code is missing") String schoolCode) {

}
