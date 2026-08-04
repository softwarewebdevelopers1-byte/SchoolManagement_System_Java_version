package com.example.school.system.DTO;

import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Builder
@Getter
@Setter
public class StudentDashboardDTO {
    private ParentInfo parent;
    private List<StudentInfo> students;

    @Builder
    @Getter
    @Setter
    public static class ParentInfo {
        private String name;
        private String phone;
    }

    @Builder
    @Getter
    @Setter
    public static class StudentInfo {
        private UUID id;
        private String name;
        private String admissionNumber;
        private Integer classGrade;
        private String classStream;
        private String gender;
        private String guardianName;
        private String guardianPhone;
        private String status;
        private List<PerformanceInfo> performance;
    }

    @Builder
    @Getter
    @Setter
    public static class PerformanceInfo {
        private UUID id;
        private UUID subjectId;
        private String subjectName;
        private Integer classGrade;
        private String classStream;
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
}