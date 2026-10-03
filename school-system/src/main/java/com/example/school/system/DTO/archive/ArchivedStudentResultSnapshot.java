package com.example.school.system.DTO.archive;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.school.system.DTO.ParentResultsResponse;

public record ArchivedStudentResultSnapshot(
        ParentResultsResponse result,
        List<Assessment> assessments,
        List<FrozenResultArchiveSnapshot.GradeDescriptor> gradingScale,
        String schoolAddress,
        Instant publishedAt,
        UUID publishedBy) {
    public record Assessment(
            UUID subjectId,
            String subject,
            String teacher,
            String period,
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
            Double points,
            Integer subjectPosition,
            Integer subjectStudentCount) {
    }
}
