package com.example.school.system.DTO;

import java.util.UUID;
import jakarta.validation.constraints.NotNull;

public record SchoolClassUpdate(
        Integer grade,
        String classStream,
@NotNull(message = "class Id must be filled") UUID classId,
             @NotNull(message = "schoolId Id must be filled") UUID schoolId) {
}
