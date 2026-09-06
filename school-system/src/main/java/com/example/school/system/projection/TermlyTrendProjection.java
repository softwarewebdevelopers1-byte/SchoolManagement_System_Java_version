package com.example.school.system.projection;

public interface TermlyTrendProjection {
    Integer getTerm();
    Double getAvgPercentage();
    Double getAvgPoints();
    Long getStudentCount();
}
