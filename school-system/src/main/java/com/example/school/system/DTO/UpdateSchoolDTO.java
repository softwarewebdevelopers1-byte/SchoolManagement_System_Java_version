package com.example.school.system.DTO;

import jakarta.validation.constraints.Email;

public record UpdateSchoolDTO(String schoolName,
        @Email String schoolEmail,
        String schoolAddress,
        String phoneNumber, String motto) {
}
