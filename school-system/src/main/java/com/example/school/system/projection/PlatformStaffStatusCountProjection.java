package com.example.school.system.projection;

import com.example.school.system.types.AccountStatus;

public interface PlatformStaffStatusCountProjection {
    AccountStatus getStatus();

    Long getCount();
}
