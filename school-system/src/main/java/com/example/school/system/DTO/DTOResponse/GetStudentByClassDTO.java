package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

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
}
