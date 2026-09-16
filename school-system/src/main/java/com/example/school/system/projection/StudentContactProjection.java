package com.example.school.system.projection;

import java.util.UUID;

public interface StudentContactProjection {
    UUID getStudentId();
    String getStudentName();
    String getPhoneNumber();
}
