package com.example.school.system.projection;

import java.util.UUID;

public interface StudentSummaryProjection {
    UUID getId();

    String getFullName();

    String getStudentAdm();

    UUID getClassId();

    String getClassName();
}
