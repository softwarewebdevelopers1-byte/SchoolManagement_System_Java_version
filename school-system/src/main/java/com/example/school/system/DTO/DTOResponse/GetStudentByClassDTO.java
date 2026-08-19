package com.example.school.system.DTO.DTOResponse;

import java.util.List;
import java.util.UUID;

import com.example.school.system.DTO.EnrolledSubjects;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class GetStudentByClassDTO {
    String name;
    String adm;
    UUID id;
    String email;
    String guardianPhone;
    String guardianName;
    List<EnrolledSubjects> enrolledSubjects;
}
