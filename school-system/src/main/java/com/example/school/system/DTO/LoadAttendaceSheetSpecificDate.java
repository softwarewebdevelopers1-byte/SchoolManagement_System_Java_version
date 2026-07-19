package com.example.school.system.DTO;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record LoadAttendaceSheetSpecificDate(@NotNull(message = "class id is required") UUID classId,
        @NotNull(message = "date is required") LocalDate date,
        @NotNull(message = "teacher id is required") UUID teacherId) {

}
