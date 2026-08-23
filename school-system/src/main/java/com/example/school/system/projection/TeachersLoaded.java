package com.example.school.system.projection;

import java.util.Set;
import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

public interface TeachersLoaded {
    String getEmail();

    AccountStatus getStatus();

    Set<UserRoles> getRoles();

    UUID getUserId();

    String getFirstName();

    String getLastName();

    String getPhoneNumber();

    UUID getTeacherId();

    String getClassStream();

    Integer getClassGrade();
}
