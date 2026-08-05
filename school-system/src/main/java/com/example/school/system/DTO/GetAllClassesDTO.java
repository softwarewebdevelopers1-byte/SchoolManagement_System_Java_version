package com.example.school.system.DTO;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class GetAllClassesDTO {
    private UUID classId;
    private String className;
    private String grade;
    private String stream;
    private String classTeacher;
    private long totalStudents;
}

