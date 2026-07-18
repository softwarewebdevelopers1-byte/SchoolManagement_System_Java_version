package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record UserUpdateDTO(@Email(message = "Invalid email") String email, String password,
        @NotNull(message = "user id must be provided") UUID userUuid) {

}
