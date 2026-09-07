package com.example.school.system.DTO.attendanceInsights;

import java.util.UUID;

public interface AttendanceSummaryDTO {
    UUID getStudentId();
    String getStudentName();
    String getAdmissionNo();
    Long getTotalSessions();
    Long getPresentSessions();
    Double getAttendancePercentage();
}
