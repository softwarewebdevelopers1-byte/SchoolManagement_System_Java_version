package com.example.school.system.projection;

public interface StudentPerformanceProjection {
    byte[] getStudentId();
    String getStudentName();
    String getAdmissionNo();
    String getStream();
    Double getTotalMarks();
    Double getPoints();
    Long getScoredSubjects();
    Double getAverage();
}
