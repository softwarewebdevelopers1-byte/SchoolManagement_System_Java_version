package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import com.example.school.system.DTO.DTOResponse.AttendanceRecordDTO;

import jakarta.validation.constraints.NotNull;

public record AttendanceSheetSubmit(
                @NotNull(message = "class id is required") UUID classId,
                @NotNull(message = "attendance sheet id is required") UUID attendanceSheetId,
                @NotNull(message = "attendance records should not be empty")
                List<AttendanceRecordDTO> attendanceRecordDTOs) {
}
