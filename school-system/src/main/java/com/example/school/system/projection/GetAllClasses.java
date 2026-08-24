package com.example.school.system.projection;

import java.util.List;
import java.util.UUID;

import com.example.school.system.models.StudentProfile;

public interface GetAllClasses {
    Integer getClassGrade();

    String getClassStream();

    UUID getUserId();

    String getFirstName();

    String getLastName();

    UUID getClassId();
}
