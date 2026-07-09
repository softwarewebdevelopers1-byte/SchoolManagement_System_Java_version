package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record OtpCreationDTO(@NotBlank(message = "email field cannot be empty") String email) {

}
