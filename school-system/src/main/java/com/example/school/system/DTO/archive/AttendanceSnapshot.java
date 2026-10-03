package com.example.school.system.DTO.archive;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import com.example.school.system.types.ClassAttendanceStatus;
import com.example.school.system.types.WholeAttendanceSheetStatus;

public record AttendanceSnapshot(
        UUID schoolId,
        String schoolName,
        UUID classId,
        String className,
        LocalDate startDate,
        LocalDate endDate,
        boolean missingDatesConfirmed,
        List<LocalDate> missingDates,
        List<Day> days,
        List<StudentSummary> studentSummaries) {
    public record Day(
            LocalDate date,
            WholeAttendanceSheetStatus sheetStatus,
            int presentCount,
            int absentCount,
            double attendancePercentage,
            List<StudentRecord> students) {
    }

    public record StudentRecord(
            UUID studentId,
            String name,
            String admissionNumber,
            ClassAttendanceStatus status) {
    }

    public record StudentSummary(
            UUID studentId,
            String name,
            String admissionNumber,
            int presentDays,
            int absentDays,
            int recordedDays,
            double attendancePercentage) {
    }
}
