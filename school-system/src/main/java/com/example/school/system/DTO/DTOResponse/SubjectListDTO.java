package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import lombok.Builder;

@Builder
public record SubjectListDTO(
        UUID subjectId,
        String subjectName,
        UUID mainTeacherId
) {}
