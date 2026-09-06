package com.example.school.system.projection;

public interface AttendanceMonthlyProjection {
    byte[] getStudentId();
    String getStudentName();
    String getAdmissionNo();
    long getTotalDays();
    long getPresentDays();
    long getAbsentDays();
    double getAttendancePercentage();
}
