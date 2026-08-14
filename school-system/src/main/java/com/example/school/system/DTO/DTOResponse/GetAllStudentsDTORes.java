package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.Gender;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GetAllStudentsDTORes {
    String studentFullName;
    String studentAdm;
    AccountStatus status;
    UUID userId;
    String email;
    String classStream;
    String classGrade;
    String classId;
    Gender gender;
    String phoneNumber;
    String guardianName;
}
