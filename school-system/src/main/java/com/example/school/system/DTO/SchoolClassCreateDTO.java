package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SchoolClassCreateDTO(
                @NotNull(message = "grade should not be blank") Integer grade,
                @NotBlank(message = "class stream should not be blank") String classStream,
                @NotNull(message = "school id is required") UUID schoolId) {
}
