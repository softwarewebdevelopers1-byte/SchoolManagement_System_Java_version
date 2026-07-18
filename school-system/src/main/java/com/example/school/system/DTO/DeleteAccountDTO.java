package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeleteAccountDTO(
                @NotBlank(message = "email should not be empty") @Email(message = "Invalid email format") String email,
                @NotNull(message = "user id is required") UUID userId) {

}
