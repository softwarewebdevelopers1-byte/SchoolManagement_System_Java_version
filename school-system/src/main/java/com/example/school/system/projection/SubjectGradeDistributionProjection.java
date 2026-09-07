package com.example.school.system.projection;

public interface SubjectGradeDistributionProjection {
    String getSubjectId();
    String getSubjectName();
    Double getAvgPercentage();
    Double getAvgPoints();
    Long getStudentCount();
    String getGrade();
    Long getCount();
}
