package com.example.school.system.DTO.DTOResponse;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record TeacherEditDTO(@Email String email,
        String password, AccountStatus status,
        String firstName,
        String lastName,
        Set<UserRoles> roles,
        @NotNull(message = "teacher id is required") UUID teacherId) {
}
