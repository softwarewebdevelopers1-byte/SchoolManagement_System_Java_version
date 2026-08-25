package com.example.school.system.projection;

import java.util.UUID;

public interface DashboardSummaryProjection {
    UUID getSchoolId();
    long getTotalStudents();
    long getTotalTeachers();
    long getTotalSubjects();
    long getActiveClasses();
}
