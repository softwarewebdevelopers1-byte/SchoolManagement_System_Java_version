package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record GetAllStudentsDTO(@NotNull(message = "school id is missing") UUID schoolId) {

}
