package com.example.school.system.projection;

import java.util.UUID;

public interface TeacherNativeDTO {
    UUID getUserId();
    String getEmail();
    String getStatus();
    String getRoles();  // Comma-separated roles from GROUP_CONCAT
    String getFirstName();
    String getLastName();
    String getPhoneNumber();
    UUID getTeacherId();
    String getClassStream();
    String getClassGrade();
}
