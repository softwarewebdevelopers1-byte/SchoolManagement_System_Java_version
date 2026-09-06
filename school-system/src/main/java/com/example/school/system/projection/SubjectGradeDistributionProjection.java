package com.example.school.system.projection;

import java.util.UUID;

public interface SubjectGradeDistributionProjection {
    UUID getSubjectId();
    String getGrade();
    Long getCount();
}
