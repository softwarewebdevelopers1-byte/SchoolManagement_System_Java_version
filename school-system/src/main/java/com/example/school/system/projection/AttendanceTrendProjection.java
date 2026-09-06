package com.example.school.system.projection;

import java.time.LocalDate;

public interface AttendanceTrendProjection {
    LocalDate getDate();
    long getPresent();
    long getAbsent();
    double getRate();
}
