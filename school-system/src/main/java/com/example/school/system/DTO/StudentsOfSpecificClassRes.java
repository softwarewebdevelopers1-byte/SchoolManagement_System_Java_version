package com.example.school.system.DTO;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class StudentsOfSpecificClassRes {
    private String fullName;
    private String Adm;
    private UUID studentId;
}
