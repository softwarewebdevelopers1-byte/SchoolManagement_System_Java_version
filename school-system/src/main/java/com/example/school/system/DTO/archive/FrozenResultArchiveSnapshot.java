package com.example.school.system.DTO.archive;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.school.system.types.ExamType;

public record FrozenResultArchiveSnapshot(
        UUID archiveId,
        int version,
        UUID schoolId,
        String schoolName,
        String schoolAddress,
        String schoolEmail,
        String schoolPhone,
        String schoolMotto,
        UUID classId,
        String className,
        String academicYear,
        Integer term,
        ExamType examType,
        UUID finalizedBy,
        Instant finalizedAt,
        List<GradeDescriptor> gradingScale,
        List<ArchivedStudentResultSnapshot> students) {
    public record GradeDescriptor(String grade, int minScore, int maxScore, double points, String description) {
    }
}
