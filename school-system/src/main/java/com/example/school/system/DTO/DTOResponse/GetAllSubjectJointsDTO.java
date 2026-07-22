package com.example.school.system.DTO.DTOResponse;

import java.util.UUID;

import com.example.school.system.types.SubjectType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class GetAllSubjectJointsDTO {
    private String subjectName;
    private UUID subjectJointId;
    private StringBuilder className;
    private UUID subjectTeacherId;
    private String subjectTeacherName;
    private SubjectType subjectType;
}
