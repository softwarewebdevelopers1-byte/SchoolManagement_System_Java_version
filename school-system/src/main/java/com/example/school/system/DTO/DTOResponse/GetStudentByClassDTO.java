package com.example.school.system.DTO.DTOResponse;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Builder
public class GetStudentByClassDTO {
    String fullName;
    String adm;
}
