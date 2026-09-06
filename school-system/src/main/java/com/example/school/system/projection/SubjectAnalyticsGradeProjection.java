package com.example.school.system.projection;

import java.util.UUID;

public interface SubjectAnalyticsGradeProjection {
    UUID getSubjectId();
    String getSubjectName();
    String getStream();
    Double getAvgPercentage();
    Double getAvgPoints();
    Long getStudentCount();
}
