package com.example.school.system.projection;

import java.util.Set;
import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.SchoolStatus;
import com.example.school.system.types.UserRoles;

public interface LoginView {
    UUID getUserId();

    String getEmail();

    UUID getTeacherId();

    String getFirstName();

    String getLastName();

    UUID getClassId();

    String getClassStream();

    Integer getClassGrade();

    UUID getSchoolId();

    ExamType getExamType();

    String getAcademicYear();

    Integer getCurrentSchoolTerm();

    SchoolStatus getSchoolStatus();

    String getPassword();

    AccountStatus getStatus();

    Set<UserRoles> getRoles();
}
