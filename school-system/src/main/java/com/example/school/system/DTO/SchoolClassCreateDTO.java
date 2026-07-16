package com.example.school.system.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SchoolClassCreateDTO(
        @NotNull (message = "grade should not be blank") Integer grade,
        @NotBlank(message = "class stream should not be blank") String classStream) {
}
