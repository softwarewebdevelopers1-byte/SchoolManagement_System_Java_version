package com.example.school.system.DTO.DTOResponse;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Builder
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GetTeachersDTO {
        private String email;
        private AccountStatus status;
        private String firstName;
        private String lastName;
        private Set<UserRoles> roles;
        private String schoolClass;
        private UUID usersId;
        private UUID teacherProfileId;
        private String phoneNumber;
}
