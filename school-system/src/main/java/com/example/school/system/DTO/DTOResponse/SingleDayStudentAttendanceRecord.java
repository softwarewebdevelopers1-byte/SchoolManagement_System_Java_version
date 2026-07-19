package com.example.school.system.DTO.DTOResponse;

import java.time.LocalDate;

import com.example.school.system.types.ClassAttendanceStatus;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class SingleDayStudentAttendanceRecord {
    private String studentName;
    private LocalDate recordDate;
    private String studentAdm;
    private ClassAttendanceStatus status;
}
