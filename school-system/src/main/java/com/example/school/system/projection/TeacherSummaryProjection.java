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

    UUID getTeacherProfileId();

    String getPhoneNumber();

    Integer getClassGrade();

    String getClassStream();

    default UUID getUserId() { return getId(); }

    default Set<UserRoles> getRoles() { return Set.of(); }

    String getFirstName();

    String getLastName();

    default String getSchoolClass() {
        return getClassGrade() == null || getClassStream() == null
                ? null
                : getClassGrade() + " " + getClassStream();
    }

    default String getSchoolName() { return null; }
}
