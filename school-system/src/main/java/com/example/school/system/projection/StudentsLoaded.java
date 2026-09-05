package com.example.school.system.projection;

import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.Gender;

public interface StudentsLoaded {
    UUID getUserId();

    String getEmail();

    String getFullName();

    String getAdm();

    Gender getGender();

    String getPhoneNumber();

    String getGuardianName();

    UUID getClassId();

    Integer getClassGrade();

    String getClassStream();

    AccountStatus getStatus();
}
