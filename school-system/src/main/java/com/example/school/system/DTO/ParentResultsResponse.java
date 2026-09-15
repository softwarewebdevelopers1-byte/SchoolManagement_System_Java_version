package com.example.school.system.DTO;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ParentResultsResponse(
        Student student,
        School school,
        Term term,
        List<SubjectResult> subjects,
        Summary summary,
        Attendance attendance,
        String teacherComment,
        String principalComment,
        LocalDate nextTermBegins) {

    public record Student(
            UUID id,
            String name,
            String studentId,
            String grade,
            String className,
            String photoUrl,
            Double overallAverage,
            String overallGrade,
            Integer position,
            Integer totalStudents) {
    }

    public record School(String name, String email, String motto, String phone, String logoUrl) {
    }

    public record Term(
            String id,
            String name,
            String startDate,
            String endDate,
            String examType,
            String previousExamType) {
    }

    public record SubjectResult(
            UUID id,
            String name,
            Integer score,
            Integer maxScore,
            String grade,
            Double points,
            String teacher,
            String remarks,
            Double previousScore,
            Double difference) {
    }

    public record Summary(
            Integer totalMarks,
            Double average,
            String overallGrade) {
    }

    public record Attendance(
            int present,
            int absent,
            int late,
            int totalDays) {
    }
}
