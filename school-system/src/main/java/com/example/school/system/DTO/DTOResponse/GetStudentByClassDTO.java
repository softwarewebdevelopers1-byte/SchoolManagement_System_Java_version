package com.example.school.system.DTO.DTOResponse;

import java.util.List;
import java.util.UUID;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.Gender;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class GetStudentByClassDTO {
    private String name;
    private String adm;
    private UUID id;
    private String email;
    private String guardianPhone;
    private Gender gender;
    private String guardianName;
    private AccountStatus status;
    private List<?> enrolledSubjects;
}
