package com.example.school.system.DTO;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.UserRoles;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class UserDto {
    private UUID userId;
    private String email;
    private Set<UserRoles> roles;
    private UUID schoolId;
    private TeacherProfileDto teacherProfileDto;
}
