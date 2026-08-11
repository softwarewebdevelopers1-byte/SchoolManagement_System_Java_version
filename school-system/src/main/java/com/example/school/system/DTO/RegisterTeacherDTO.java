package com.example.school.system.DTO;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterTeacherDTO {
    @NotNull
    UUID schoolId;
    @NotBlank
    private String firstName;
    private String lastName;
    @NotBlank
    @Email
    private String email;
    private String password;
    @NotNull
    private Set<UserRoles> roles;
    private AccountStatus status;
    @NotBlank
    private String phoneNumber;
}
