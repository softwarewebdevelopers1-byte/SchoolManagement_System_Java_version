package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;
import com.example.school.system.types.SubjectType;
import lombok.Builder;

@Builder
public record SubjectJointSummaryDTO(
        UUID subjectJointId,
        String subjectName,
        String className,
        UUID classId,
        UUID subjectTeacherId,
        String subjectTeacherName,
        SubjectType subjectType,
        String electiveCode
) {}
