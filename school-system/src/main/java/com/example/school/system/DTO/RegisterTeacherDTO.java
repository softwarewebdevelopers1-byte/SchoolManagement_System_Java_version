package com.example.school.system.DTO;

import java.util.List;

import com.example.school.system.types.UserRoles;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterTeacherDTO {
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private List<UserRoles>roles;
}
