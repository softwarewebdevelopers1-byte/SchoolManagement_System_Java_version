package com.example.school.system.DTO.archive;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

public record AttendanceArchiveRequest(
        @NotNull UUID classId,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        boolean confirmMissingDates) {
    public AttendanceArchiveRequest(UUID classId, LocalDate startDate, LocalDate endDate) {
        this(classId, startDate, endDate, false);
    }
}
