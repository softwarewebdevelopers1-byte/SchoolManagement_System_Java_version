package com.example.school.system.services.archive;

import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.example.school.system.DTO.archive.ArchiveDownload;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.types.ArchiveStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = { "edunex.archive.enabled", "edunex.archive.r2.enabled" }, havingValue = "true")
public class ArchiveDocumentService {
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final R2ObjectStorage objectStorage;

    public ArchiveDownload download(UUID archiveId, String kind) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        ResultArchive result = resultArchiveRepository.findById(archiveId)
                .filter(archive -> archive.getSchoolId().equals(schoolId)
                        && archive.getStatus() == ArchiveStatus.VERIFIED)
                .orElse(null);
        if (result != null) {
            if ("pdf".equalsIgnoreCase(kind)) {
                return new ArchiveDownload(verifiedObject(
                        result.getDocumentKey(), result.getDocumentSha256(), result.getDocumentSize()), "application/pdf",
                        "results-" + archiveId + ".pdf");
            }
            if ("snapshot".equalsIgnoreCase(kind)) {
                return new ArchiveDownload(verifiedObject(
                        result.getSnapshotKey(), result.getSnapshotSha256(), result.getSnapshotSize()), "application/json",
                        "results-" + archiveId + ".json");
            }
        }

        AttendanceArchive attendance = attendanceArchiveRepository.findById(archiveId)
                .filter(archive -> archive.getSchoolId().equals(schoolId)
                        && archive.getStatus() == ArchiveStatus.VERIFIED)
                .orElse(null);
        if (attendance != null) {
            if ("pdf".equalsIgnoreCase(kind)) {
                return new ArchiveDownload(verifiedObject(
                        attendance.getDocumentKey(), attendance.getDocumentSha256(), attendance.getDocumentSize()), "application/pdf",
                        "attendance-" + archiveId + ".pdf");
            }
            if ("snapshot".equalsIgnoreCase(kind)) {
                return new ArchiveDownload(verifiedObject(
                        attendance.getSnapshotKey(), attendance.getSnapshotSha256(), attendance.getSnapshotSize()), "application/json",
                        "attendance-" + archiveId + ".json");
            }
        }
        throw new SchoolResourceNotFoundExceptionHandler("verified archive not found");
    }

    private byte[] verifiedObject(String key, String sha256, Long expectedSize) {
        byte[] content = objectStorage.get(key);
        if (expectedSize == null || content.length != expectedSize || !ArchiveHash.sha256(content).equals(sha256)) {
            throw new IllegalStateException("Archived object integrity check failed");
        }
        return content;
    }
}
