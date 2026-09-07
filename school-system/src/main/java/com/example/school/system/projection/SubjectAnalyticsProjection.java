package com.example.school.system.projection;

public interface SubjectAnalyticsProjection {
    String getSubjectId();
    String getSubjectName();
    Double getAvgPercentage();
    Double getAvgPoints();
    Long getStudentCount();
}
