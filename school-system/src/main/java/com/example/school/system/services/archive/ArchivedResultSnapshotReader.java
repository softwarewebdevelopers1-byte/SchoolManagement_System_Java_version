package com.example.school.system.services.archive;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.models.ResultArchiveStudent;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArchivedResultSnapshotReader {
    private final ResultArchiveStudentRepository studentArchiveRepository;
    private final ObjectProvider<R2ObjectStorage> storageProvider;
    private final ObjectMapper objectMapper;

    public Optional<ParentResultsResponse> read(
            UUID studentId,
            UUID classId,
            UUID schoolId,
            String academicYear,
            Integer term,
            ExamType examType) {
        if (classId == null || schoolId == null) {
            return Optional.empty();
        }
        R2ObjectStorage storage = storageProvider.getIfAvailable();
        if (storage == null) {
            return Optional.empty();
        }
        var candidates =
                studentArchiveRepository
                        .findAuthorizedSnapshot(
                                studentId, classId, schoolId, academicYear, term, examType, ArchiveStatus.VERIFIED);
        if (candidates.isEmpty()) {
            return Optional.empty();
        }
        ResultArchiveStudent archivedStudent = candidates.getFirst();
        byte[] content = storage.get(archivedStudent.getSnapshotKey());
        if (content.length != archivedStudent.getSnapshotSize()
                || !ArchiveHash.sha256(content).equals(archivedStudent.getSnapshotSha256())) {
            throw new IllegalStateException("Archived result snapshot integrity check failed");
        }
        try {
            return Optional.of(objectMapper.readValue(content, ArchivedStudentResultSnapshot.class).result());
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Unable to read archived result snapshot", exception);
        }
    }
}
