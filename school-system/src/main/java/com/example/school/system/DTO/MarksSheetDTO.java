package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import com.example.school.system.types.SubjectType;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class MarksSheetDTO {
    private UUID subjectJointId;
    private String subjectName;
    private SubjectType subjectType;
    private UUID classId;
    private String className;
    private String electiveCode;
    private List<MarksRowDTO> marksRow;
    private Integer maxCat1;
    private Integer maxCat2;
    private Integer maxCat3;
    private Integer maxExam;
}
