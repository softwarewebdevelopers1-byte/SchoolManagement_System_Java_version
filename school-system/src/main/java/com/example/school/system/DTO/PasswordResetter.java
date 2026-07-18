package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PasswordResetter(@NotBlank(message = "password field is empty") String password,
        @NotNull(message = "Token must be provided") String token) {

}
