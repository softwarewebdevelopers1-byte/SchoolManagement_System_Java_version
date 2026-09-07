package com.example.school.system.projection;

import java.util.UUID;
import java.util.Set;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

public interface TeacherSummaryProjection {
    UUID getId();

    String getFullName();

    String getEmail();

    AccountStatus getStatus();

    default UUID getUserId() { return getId(); }

    default Set<UserRoles> getRoles() { return Set.of(); }

    default String getFirstName() {
        String name = getFullName() == null ? "" : getFullName().trim();
        int separator = name.indexOf(' ');
        return separator < 0 ? name : name.substring(0, separator);
    }

    default String getLastName() {
        String name = getFullName() == null ? "" : getFullName().trim();
        int separator = name.indexOf(' ');
        return separator < 0 ? "" : name.substring(separator + 1);
    }

    default String getSchoolName() { return null; }
}
