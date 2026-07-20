package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record UnassignClassTeacherDTO(@NotNull(message = "school id is required") UUID schoolId,
        @NotNull(message = "class id is required") UUID classId) {
}
