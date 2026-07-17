package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record PasswordResetter(@NotBlank(message = "password field is empty") String password) {

}
