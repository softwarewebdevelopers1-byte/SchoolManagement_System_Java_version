package com.example.school.system.DTO.archive;

import java.util.List;

import com.example.school.system.DTO.ParentResultsResponse;

public record ArchivedStudentResultSnapshot(
        ParentResultsResponse result,
        List<Assessment> assessments) {
    public record Assessment(
            String subject,
            String teacher,
            Integer cat1,
            Integer cat2,
            Integer cat3,
            Integer exam,
            Integer maxCat1,
            Integer maxCat2,
            Integer maxCat3,
            Integer maxExam,
            Integer total,
            Integer percentage,
            String grade,
            Double points) {
    }
}
