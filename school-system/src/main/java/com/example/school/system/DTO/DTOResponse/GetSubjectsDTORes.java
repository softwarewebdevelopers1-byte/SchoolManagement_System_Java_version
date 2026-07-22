package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GetSubjectsDTORes {
    private UUID subjectId;
    private String subjectName;
}
