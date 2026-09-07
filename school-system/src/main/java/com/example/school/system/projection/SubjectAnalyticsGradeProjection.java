package com.example.school.system.projection;

public interface SubjectAnalyticsGradeProjection {
    String getSubjectId();
    String getSubjectName();
    String getStream();
    Double getAvgPercentage();
    Double getAvgPoints();
    Long getStudentCount();
}
