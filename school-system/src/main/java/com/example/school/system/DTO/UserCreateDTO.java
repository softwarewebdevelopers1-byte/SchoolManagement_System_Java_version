package com.example.school.system.DTO;

import java.util.Set;
import java.util.UUID;

import com.example.school.system.types.UserRoles;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class UserCreateDTO {
    private UserRoles role;
    private String name;
    @Email
    private String email;
    private String phone;
    private String department;
    private String status;
    private Integer classGrade;
    private String classStream;
    private Set<String> subjects;
    private UUID classId;
    private String studentFullName;
    private String studentAdm;
    private String guardianName;
    private String guardianPhone;
    private UUID schoolId;
    private String password;
}