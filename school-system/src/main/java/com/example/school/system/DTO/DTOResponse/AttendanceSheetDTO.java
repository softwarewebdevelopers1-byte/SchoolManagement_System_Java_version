package com.example.school.system.DTO.DTOResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.school.system.types.WholeAttendanceSheetStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
@AllArgsConstructor
public class AttendanceSheetDTO {
    private UUID sheetId;
    private String className;
    private LocalDate date;
    private WholeAttendanceSheetStatus status;
    private List<AttendanceRecordDTO> records;
}
