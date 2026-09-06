package com.example.school.system.projection;

import java.util.UUID;

public interface AtRiskStudentProjection {
    UUID getStudentId();
    String getStudentName();
    String getAdmissionNo();
    Double getAvgPercentage();
}
