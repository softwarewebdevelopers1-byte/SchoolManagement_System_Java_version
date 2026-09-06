package com.example.school.system.projection;

import java.util.UUID;

public interface SubjectAnalyticsProjection {
    UUID getSubjectId();
    String getSubjectName();
    Double getAvgPercentage();
    Double getAvgPoints();
    Long getStudentCount();
}
