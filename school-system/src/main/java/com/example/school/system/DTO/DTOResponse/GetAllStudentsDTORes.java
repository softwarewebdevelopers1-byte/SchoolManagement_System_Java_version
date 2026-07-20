package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import com.example.school.system.types.AccountStatus;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GetAllStudentsDTORes {
    String fullName;
    String adm;
    AccountStatus status;
    UUID userId;
    String email;
}
