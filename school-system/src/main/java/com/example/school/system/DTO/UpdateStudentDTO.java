package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.types.AccountStatus;

import jakarta.validation.constraints.Email;

public record UpdateStudentDTO(@Email(message = "Invalid email format") String email, String password,
        String studentFullName,
        String studentAdm,
        String phoneNumber,
        UUID classId,
        AccountStatus status) {

}
