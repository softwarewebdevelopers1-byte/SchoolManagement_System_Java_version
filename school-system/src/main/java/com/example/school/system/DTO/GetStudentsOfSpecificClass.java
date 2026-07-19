package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record GetStudentsOfSpecificClass(@NotNull(message = "class id is required") UUID classId) {

}
