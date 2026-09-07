package com.example.school.system.projection;

import java.util.UUID;

public interface StudentPerformanceProjection {
    UUID getStudentId();
    String getStudentName();
    String getAdmissionNo();
    String getStream();
    Double getTotalMarks();
    Double getPoints();
    Long getScoredSubjects();
    Double getAverage();
}
