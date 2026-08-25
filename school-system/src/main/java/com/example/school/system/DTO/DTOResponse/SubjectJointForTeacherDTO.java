package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import com.example.school.system.types.SubjectType;
import lombok.Builder;

@Builder
public record SubjectJointForTeacherDTO(
        UUID subjectId,
        Integer classGrade,
        String classStream,
        String subjectName,
        SubjectType enrollmentMode,
        String sharedSlotId
) {}
