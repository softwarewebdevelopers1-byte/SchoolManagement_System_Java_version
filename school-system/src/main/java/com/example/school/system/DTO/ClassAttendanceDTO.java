package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record ClassAttendanceDTO(@NotNull(message = "class id is required") UUID classId,
        @NotNull(message = "teacher id is required") UUID teacherId) {
}
