package com.example.school.system.services.archive;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.types.ExamType;

public record ArchivePayload(
        UUID archiveId,
        int version,
        UUID schoolId,
        UUID classId,
        String schoolName,
        String className,
        String academicYear,
        Integer term,
        ExamType examType,
        Instant requestedAt,
        String objectPrefix,
        List<ArchivedStudentResultSnapshot> students) {
    public record StudentFile(
            UUID studentId,
            String studentName,
            String admissionNumber,
            String snapshotKey,
            String snapshotSha256,
            long snapshotSize,
            String documentKey,
            String documentSha256,
            long documentSize) {
    }
}
