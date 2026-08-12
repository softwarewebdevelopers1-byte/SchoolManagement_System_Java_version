package com.example.school.system.DTO;

import java.util.UUID;

import com.example.school.system.types.SubjectType;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class GetSubjectJointsForSubjectTeacher {
    private UUID subjectId;
    private Integer classGrade;
    private String classStream;
    private int studentCount;
    private SubjectType enrollmentMode;
    private String sharedSlotId;
    private String subjectName;
}
