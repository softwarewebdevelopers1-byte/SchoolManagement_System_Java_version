package com.example.school.system.projection;

import java.util.UUID;

import com.example.school.system.types.UserRoles;

public interface UserRoleProjection {
    UUID getUserId();

    UserRoles getRole();
}
