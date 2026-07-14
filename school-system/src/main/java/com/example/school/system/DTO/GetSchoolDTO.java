package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;

public record GetSchoolDTO(@NotBlank(message = "school code cannot be empty") String schoolCode) {

}