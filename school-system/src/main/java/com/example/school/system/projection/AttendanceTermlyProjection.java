package com.example.school.system.projection;

public interface AttendanceTermlyProjection {
    byte[] getStudentId();
    String getStudentName();
    String getAdmissionNo();
    long getTotalSessions();
    long getPresentSessions();
    double getAttendancePercentage();
}
