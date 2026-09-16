package com.example.school.system.DTO.stats;

import java.util.UUID;

public record StudentPerformanceDTO(
        UUID studentId,
        String studentName,
        String admissionNo,
        String stream,
        Double totalMarks,
        Double points,
        Long scoredSubjects,
        Double average,
        String examType,
        Integer term,
        String academicYear) {

    public StudentPerformanceDTO(
            UUID studentId,
            String studentName,
            String admissionNo,
            String stream,
            Double totalMarks,
            Double points,
            Long scoredSubjects,
            Double average) {
        this(studentId, studentName, admissionNo, stream, totalMarks, points, scoredSubjects, average, null, null, null);
    }
}
