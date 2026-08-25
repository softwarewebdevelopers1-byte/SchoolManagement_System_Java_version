package com.example.school.system.projection;

import java.util.UUID;

public interface ClassTeacherProjection {
    UUID getClassId();
    UUID getTeacherProfileId();
    UUID getUserId();
    String getEmail();
    String getFirstName();
    String getLastName();
}
