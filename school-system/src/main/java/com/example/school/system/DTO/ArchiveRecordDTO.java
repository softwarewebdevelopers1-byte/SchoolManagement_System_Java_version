package com.example.school.system.DTO;

import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class ArchiveRecordDTO {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private Integer classGrade;
    private String classStream;
    private String subjectName;
    private Integer term;
    private Integer year;
    private String examType;
    private Integer cat1;
    private Integer cat2;
    private Integer cat3;
    private Integer exam;
    private Integer finalScore;
    private Double percentage;
    private String cbcBand;
    private Double points;
}