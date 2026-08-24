package com.example.school.system.projection;

import java.util.UUID;
public interface GetAllClasses {
    Integer getClassGrade();

    String getClassStream();

    UUID getUserId();

    String getFirstName();

    String getLastName();

    UUID getClassId();
}
