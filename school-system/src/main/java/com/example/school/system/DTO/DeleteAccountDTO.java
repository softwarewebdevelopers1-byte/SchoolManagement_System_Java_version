package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record DeleteAccountDTO(@NotBlank(message = "email should not be empty") @Email String email) {

}
