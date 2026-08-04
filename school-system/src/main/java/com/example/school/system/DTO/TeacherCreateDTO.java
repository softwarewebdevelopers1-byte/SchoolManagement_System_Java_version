package com.example.school.system.DTO;

import java.util.Set;

import com.example.school.system.types.UserRoles;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record TeacherCreateDTO(
        @Email @NotBlank String email,
        @NotBlank String password,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotEmpty Set<UserRoles> roles) {
}
