package com.example.school.system.DTO.DTOResponse;

import java.util.Set;

import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GetTeachersDTO {
        private String email;
        private AccountStatus status;
        private String firstName;
        private String lastName;
        private Set<UserRoles> roles;
        private String schoolClass;
}
