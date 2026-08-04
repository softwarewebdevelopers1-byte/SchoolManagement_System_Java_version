package com.example.school.system.DTO;

import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ClassSubjectDTO {
    private UUID subjectId;
    private Integer classGrade;
    private String classStream;
    private Boolean isOffered;
    private String enrollmentMode;
    private UUID sharedSlotId;
}