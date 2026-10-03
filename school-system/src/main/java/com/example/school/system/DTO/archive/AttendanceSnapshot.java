package com.example.school.system.DTO.archive;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.school.system.types.ClassAttendanceStatus;
import com.example.school.system.types.WholeAttendanceSheetStatus;

public record AttendanceSnapshot(
        UUID schoolId,
        UUID classId,
        String className,
        LocalDate startDate,
        LocalDate endDate,
        List<Day> days) {
    public record Day(
            LocalDate date,
            WholeAttendanceSheetStatus sheetStatus,
            List<StudentRecord> students) {
    }

    public record StudentRecord(
            UUID studentId,
            String name,
            String admissionNumber,
            ClassAttendanceStatus status) {
    }
}
