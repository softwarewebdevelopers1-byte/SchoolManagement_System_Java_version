package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.types.ClassAttendanceStatus;

import jakarta.validation.constraints.NotNull;


public record StudentAttendanceDTO(@NotNull(message = "status field must be filled") ClassAttendanceStatus status,
        @NotNull(message = "attendance record id must be filled") UUID attendanceRecord) {
}
