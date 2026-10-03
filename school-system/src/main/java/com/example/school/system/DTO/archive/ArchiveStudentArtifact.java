package com.example.school.system.DTO.archive;

import java.util.UUID;

public record ArchiveStudentArtifact(
        UUID studentId,
        String studentName,
        String admissionNumber) {
}
