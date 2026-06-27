package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record CreateSchoolDTO(@NotBlank String schoolName) {
}
