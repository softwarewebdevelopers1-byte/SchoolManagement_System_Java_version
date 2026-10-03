package com.example.school.system.services.archive;

import java.util.UUID;
import java.nio.file.Path;

import org.springframework.data.domain.PageRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.example.school.system.DTO.archive.ArchiveDownload;
import com.example.school.system.DTO.archive.ArchiveFileDownload;
import com.example.school.system.DTO.archive.ArchiveStudentArtifact;
import com.example.school.system.DTO.archive.ArchiveStudentsPageResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.models.ResultArchiveStudent;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.types.ArchiveStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = { "edunex.archive.enabled", "edunex.archive.r2.enabled" }, havingValue = "true")
public class ArchiveDocumentService {
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;
    private final ResultArchiveStudentRepository resultArchiveStudentRepository;
    private final AuthenticatedUserService authenticatedUserService;
    private final R2ObjectStorage objectStorage;

    public ArchiveDownload download(UUID archiveId, String kind) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        ResultArchive result = resultArchiveRepository.findById(archiveId)
                .filter(archive -> belongsToSchool(archive.getSchoolId(), schoolId)
                        && isRetrievable(archive.getStatus()))
                .orElse(null);
        if (result != null) {
            if ("pdf".equalsIgnoreCase(kind)) {
                return new ArchiveDownload(verifiedObject(
                        result.getDocumentKey(), result.getDocumentSha256(), result.getDocumentSize()), "application/pdf",
                        resultBaseName(result) + ".pdf");
            }

            if ("snapshot".equalsIgnoreCase(kind) || "manifest".equalsIgnoreCase(kind)) {
                boolean manifest = "manifest".equalsIgnoreCase(kind);
                return new ArchiveDownload(verifiedObject(
                        manifest ? result.getSnapshotKey() : result.getClassSnapshotKey(),
                        manifest ? result.getSnapshotSha256() : result.getClassSnapshotSha256(),
                        manifest ? result.getSnapshotSize() : result.getClassSnapshotSize()), "application/json",
                        resultBaseName(result) + (manifest ? "-manifest.json" : "-class-snapshot.json"));
            }
        }

        AttendanceArchive attendance = attendanceArchiveRepository.findById(archiveId)
                .filter(archive -> belongsToSchool(archive.getSchoolId(), schoolId)
                        && isRetrievable(archive.getStatus()))
                .orElse(null);
        if (attendance != null) {
            if ("pdf".equalsIgnoreCase(kind)) {
                return new ArchiveDownload(verifiedObject(
                        attendance.getDocumentKey(), attendance.getDocumentSha256(), attendance.getDocumentSize()), "application/pdf",
                        "attendance-" + archiveId + ".pdf");
            }
            if ("snapshot".equalsIgnoreCase(kind) || "manifest".equalsIgnoreCase(kind)) {
                boolean manifest = "manifest".equalsIgnoreCase(kind);
                return new ArchiveDownload(verifiedObject(
                        manifest ? attendance.getManifestKey() : attendance.getSnapshotKey(),
                        manifest ? attendance.getManifestSha256() : attendance.getSnapshotSha256(),
                        manifest ? attendance.getManifestSize() : attendance.getSnapshotSize()), "application/json",
                        "attendance-" + archiveId + (manifest ? "-manifest.json" : ".json"));
            }
        }
        throw new SchoolResourceNotFoundExceptionHandler("verified archive not found");
    }

    public ArchiveDownload downloadAttendance(UUID archiveId, String kind) {
        if (!"snapshot".equalsIgnoreCase(kind) && !"manifest".equalsIgnoreCase(kind)) {
            throw new SchoolResourceNotFoundExceptionHandler("attendance archive artifact not found");
        }
        AttendanceArchive archive = findOwnedAttendanceArchive(archiveId);
        boolean manifest = "manifest".equalsIgnoreCase(kind);
        String key = manifest ? archive.getManifestKey() : archive.getSnapshotKey();
        String hash = manifest ? archive.getManifestSha256() : archive.getSnapshotSha256();
        Long size = manifest ? archive.getManifestSize() : archive.getSnapshotSize();
        String filename = attendanceBaseName(archive)
                + (manifest ? "-manifest.json" : "-snapshot.json");
        return new ArchiveDownload(verifiedObject(key, hash, size), "application/json", filename);
    }

    public ArchiveFileDownload downloadAttendancePdf(UUID archiveId) {
        AttendanceArchive archive = findOwnedAttendanceArchive(archiveId);
        return verifiedPdf(
                archive.getDocumentKey(),
                archive.getDocumentSha256(),
                archive.getDocumentSize(),
                attendanceBaseName(archive) + ".pdf");
    }

    public ArchiveFileDownload downloadPdf(UUID archiveId, UUID studentId) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        if (studentId != null) {
            ResultArchive archive = resultArchiveRepository.findById(archiveId)
                    .filter(item -> belongsToSchool(item.getSchoolId(), schoolId)
                            && isRetrievable(item.getStatus()))
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("verified archive not found"));
            ResultArchiveStudent student = resultArchiveStudentRepository
                    .findByArchiveIdAndStudentId(archive.getId(), studentId)
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("archived student not found"));
            return verifiedPdf(
                    student.getDocumentKey(), student.getDocumentSha256(), student.getDocumentSize(),
                    studentResultBaseName(archive, student) + ".pdf");
        }

        ResultArchive result = resultArchiveRepository.findById(archiveId)
                .filter(item -> belongsToSchool(item.getSchoolId(), schoolId)
                        && isRetrievable(item.getStatus()))
                .orElse(null);
        if (result != null) {
            return verifiedPdf(
                    result.getDocumentKey(), result.getDocumentSha256(), result.getDocumentSize(),
                    resultBaseName(result) + ".pdf");
        }
        AttendanceArchive attendance = attendanceArchiveRepository.findById(archiveId)
                .filter(item -> belongsToSchool(item.getSchoolId(), schoolId)
                        && isRetrievable(item.getStatus()))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("verified archive not found"));
        return verifiedPdf(
                attendance.getDocumentKey(), attendance.getDocumentSha256(), attendance.getDocumentSize(),
                "attendance-" + archiveId + ".pdf");
    }

    public ArchiveDownload downloadStudent(
            UUID archiveId, UUID studentId, String kind) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        ResultArchive archive = resultArchiveRepository.findById(archiveId)
                .filter(item -> belongsToSchool(item.getSchoolId(), schoolId)
                        && isRetrievable(item.getStatus()))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("verified archive not found"));
        ResultArchiveStudent student = resultArchiveStudentRepository
                .findByArchiveIdAndStudentId(archive.getId(), studentId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("archived student not found"));
        if ("pdf".equalsIgnoreCase(kind)) {
            return new ArchiveDownload(verifiedObject(
                    student.getDocumentKey(), student.getDocumentSha256(), student.getDocumentSize()),
                    "application/pdf", studentResultBaseName(archive, student) + ".pdf");
        }
        if ("snapshot".equalsIgnoreCase(kind)) {
            return new ArchiveDownload(verifiedObject(
                    student.getSnapshotKey(), student.getSnapshotSha256(), student.getSnapshotSize()),
                    "application/json", studentResultBaseName(archive, student) + ".json");
        }
        throw new SchoolResourceNotFoundExceptionHandler("archived student artifact not found");
    }

    public ArchiveStudentsPageResponse listStudentArtifacts(UUID archiveId, int page, int size) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        ResultArchive archive = resultArchiveRepository.findById(archiveId)
                .filter(item -> belongsToSchool(item.getSchoolId(), schoolId)
                        && isRetrievable(item.getStatus()))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("verified archive not found"));
        int normalizedPage = Math.max(0, Math.min(page, 100));
        int normalizedSize = Math.max(1, Math.min(size, 100));
        var studentPage = resultArchiveStudentRepository
                .findAllByArchiveIdOrderByStudentNameAsc(archive.getId(),
                        PageRequest.of(normalizedPage, normalizedSize));
        return new ArchiveStudentsPageResponse(
                studentPage.getContent().stream()
                        .map(student -> new ArchiveStudentArtifact(
                                student.getStudentId(), student.getStudentName(), student.getAdmissionNumber()))
                        .toList(),
                studentPage.getNumber(),
                studentPage.getSize(),
                studentPage.hasNext());
    }

    private boolean isRetrievable(ArchiveStatus status) {
        return status == ArchiveStatus.VERIFIED || status == ArchiveStatus.SUPERSEDED;
    }

    private boolean belongsToSchool(UUID archiveSchoolId, UUID authenticatedSchoolId) {
        return archiveSchoolId != null
                && authenticatedSchoolId != null
                && archiveSchoolId.equals(authenticatedSchoolId);
    }

    private byte[] verifiedObject(String key, String sha256, Long expectedSize) {
        if (key == null || sha256 == null || expectedSize == null) {
            throw new ArchiveStorageUnavailableException();
        }
        byte[] content = objectStorage.get(key);
        if (content.length != expectedSize || !ArchiveHash.sha256(content).equals(sha256)) {
            throw new ArchiveStorageUnavailableException();
        }
        return content;
    }

    private ArchiveFileDownload verifiedPdf(String key, String sha256, Long expectedSize, String fileName) {
        if (key == null || sha256 == null || expectedSize == null) {
            throw new ArchiveStorageUnavailableException();
        }
        Path file = objectStorage.getVerifiedTemporaryFile(key, sha256, expectedSize);
        return new ArchiveFileDownload(file, expectedSize, "application/pdf", fileName);
    }

    private AttendanceArchive findOwnedAttendanceArchive(UUID archiveId) {
        UUID schoolId = authenticatedUserService.currentUser().user().getSchoolId();
        return attendanceArchiveRepository.findById(archiveId)
                .filter(archive -> belongsToSchool(archive.getSchoolId(), schoolId)
                        && isRetrievable(archive.getStatus()))
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("verified attendance archive not found"));
    }

    private String attendanceBaseName(AttendanceArchive archive) {
        return safeFilePart(archive.getSchoolName()) + "-"
                + safeFilePart(archive.getClassName()) + "-attendance-"
                + archive.getStartDate() + "-to-" + archive.getEndDate();
    }

    private String resultBaseName(ResultArchive archive) {
        return safeFilePart(archive.getClassName()) + "-"
                + safeFilePart(archive.getAcademicYear()) + "-term-" + archive.getTerm() + "-"
                + safeFilePart(archive.getExamType() == null ? null : archive.getExamType().name())
                + "-results-v" + archive.getVersion();
    }

    private String studentResultBaseName(ResultArchive archive, ResultArchiveStudent student) {
        return safeFilePart(student.getStudentName()) + "-" + resultBaseName(archive);
    }

    private String safeFilePart(String value) {
        String safe = value == null ? "" : value.toLowerCase(java.util.Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        return safe.isBlank() ? "school" : safe;
    }
}
