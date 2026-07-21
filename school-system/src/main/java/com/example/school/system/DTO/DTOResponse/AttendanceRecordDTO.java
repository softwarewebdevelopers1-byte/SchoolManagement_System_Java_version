package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import com.example.school.system.types.ClassAttendanceStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Setter
@Getter
@AllArgsConstructor
public class AttendanceRecordDTO {
    private UUID recordId;
    private String studentName;
    private ClassAttendanceStatus status;
}

