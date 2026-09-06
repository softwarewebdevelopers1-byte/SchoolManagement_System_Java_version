package com.example.school.system.projection;

import com.example.school.system.types.AccountStatus;

public interface TeacherStatusCountProjection {
    AccountStatus getStatus();
    Long getCount();
}
