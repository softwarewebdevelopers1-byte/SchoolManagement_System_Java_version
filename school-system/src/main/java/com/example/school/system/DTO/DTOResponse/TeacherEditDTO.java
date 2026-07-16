package com.example.school.system.DTO.DTOResponse;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import jakarta.validation.constraints.Email;

public record TeacherEditDTO(@Email String email,
        String password, AccountStatus status,
        String firstName,
        String lastName,
        Set<UserRoles> roles,
        UUID schoolClassId) {

}
