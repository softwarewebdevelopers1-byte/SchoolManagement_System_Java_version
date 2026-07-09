package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginUserDTO(@Email @NotBlank(message = "Email is required") String email,
                @NotBlank(message = "password is required") String password) {

}
