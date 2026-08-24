package com.example.school.system.DTO.DTOResponse;

import java.util.Set;
import java.util.UUID;
import com.example.school.system.types.UserRoles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SuperAdminUserRes {
    private UUID userId;
    private String email;
    private Set<UserRoles> roles;
    private String schoolName;
    private String schoolCode;
    private String firstName;
    private String lastName;
    private String status;
    private String registeredDate;
}
