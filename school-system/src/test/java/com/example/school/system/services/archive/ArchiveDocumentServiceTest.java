package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.DTO.DTOResponse.AuthenticatedUserContext;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;

@ExtendWith(MockitoExtension.class)
class ArchiveDocumentServiceTest {
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ResultArchiveStudentRepository resultArchiveStudentRepository;
    @Mock private AuthenticatedUserService authenticatedUserService;
    @Mock private R2ObjectStorage objectStorage;

    @Test
    void downloadsPersistedAttendanceSnapshotAndManifestAsJson() {
        UUID archiveId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        AttendanceArchive archive = verifiedAttendanceArchive(archiveId, schoolId);
        byte[] snapshotBytes = "{\"days\":[]}".getBytes(StandardCharsets.UTF_8);
        byte[] manifestBytes = "{\"type\":\"ATTENDANCE\",\"version\":1}".getBytes(StandardCharsets.UTF_8);
        archive.setSnapshotKey("persisted/snapshot.json");
        archive.setSnapshotSha256(ArchiveHash.sha256(snapshotBytes));
        archive.setSnapshotSize((long) snapshotBytes.length);
        archive.setManifestKey("persisted/manifest.json");
        archive.setManifestSha256(ArchiveHash.sha256(manifestBytes));
        archive.setManifestSize((long) manifestBytes.length);
        stubAttendanceLookup(archiveId, schoolId, archive);
        when(objectStorage.get("persisted/snapshot.json")).thenReturn(snapshotBytes);
        when(objectStorage.get("persisted/manifest.json")).thenReturn(manifestBytes);

        ArchiveDocumentService service = service();
        var snapshot = service.downloadAttendance(archiveId, "snapshot");
        var manifest = service.downloadAttendance(archiveId, "manifest");

        assertEquals("application/json", snapshot.contentType());
        assertEquals("greenhill-academy-1-north-attendance-2026-10-02-to-2026-10-03-snapshot.json",
                snapshot.fileName());
        assertArrayEquals(snapshotBytes, snapshot.content());
        assertEquals("application/json", manifest.contentType());
        assertEquals("greenhill-academy-1-north-attendance-2026-10-02-to-2026-10-03-manifest.json",
                manifest.fileName());
        assertArrayEquals(manifestBytes, manifest.content());
        verify(objectStorage).get("persisted/snapshot.json");
        verify(objectStorage).get("persisted/manifest.json");
    }

    @Test
    void downloadsResultClassSnapshotAndManifestFromPersistedMetadata() {
        UUID archiveId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        byte[] classSnapshot = "{\"students\":[]}".getBytes(StandardCharsets.UTF_8);
        byte[] manifestBytes = "{\"type\":\"RESULT\",\"version\":1}".getBytes(StandardCharsets.UTF_8);
        ResultArchive archive = new ResultArchive();
        archive.setId(archiveId);
        archive.setSchoolId(schoolId);
        archive.setClassName("1 North");
        archive.setAcademicYear("2026");
        archive.setTerm(2);
        archive.setExamType(ExamType.ENDTERM);
        archive.setVersion(1);
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setClassSnapshotKey("persisted/class-snapshot.json");
        archive.setClassSnapshotSha256(ArchiveHash.sha256(classSnapshot));
        archive.setClassSnapshotSize((long) classSnapshot.length);
        archive.setSnapshotKey("persisted/manifest.json");
        archive.setSnapshotSha256(ArchiveHash.sha256(manifestBytes));
        archive.setSnapshotSize((long) manifestBytes.length);
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), java.util.List.of()));
        when(resultArchiveRepository.findById(archiveId)).thenReturn(Optional.of(archive));
        when(objectStorage.get("persisted/class-snapshot.json")).thenReturn(classSnapshot);
        when(objectStorage.get("persisted/manifest.json")).thenReturn(manifestBytes);

        var snapshot = service().download(archiveId, "snapshot");
        var manifest = service().download(archiveId, "manifest");

        assertArrayEquals(classSnapshot, snapshot.content());
        assertEquals("1-north-2026-term-2-endterm-results-v1-class-snapshot.json", snapshot.fileName());
        assertArrayEquals(manifestBytes, manifest.content());
        assertEquals("1-north-2026-term-2-endterm-results-v1-manifest.json", manifest.fileName());
        verify(objectStorage).get("persisted/class-snapshot.json");
        verify(objectStorage).get("persisted/manifest.json");
    }

    @Test
    void resolvesAttendancePdfFromPersistedMetadataAndProvidesPrintableFilename(@TempDir Path tempDir)
            throws Exception {
        UUID archiveId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        AttendanceArchive archive = verifiedAttendanceArchive(archiveId, schoolId);
        Path pdf = tempDir.resolve("report.pdf");
        byte[] bytes = "%PDF-test".getBytes(StandardCharsets.US_ASCII);
        Files.write(pdf, bytes);
        archive.setDocumentKey("persisted/attendance.pdf");
        archive.setDocumentSha256(ArchiveHash.sha256(bytes));
        archive.setDocumentSize((long) bytes.length);
        stubAttendanceLookup(archiveId, schoolId, archive);
        when(objectStorage.getVerifiedTemporaryFile(
                "persisted/attendance.pdf", ArchiveHash.sha256(bytes), bytes.length)).thenReturn(pdf);

        var download = service().downloadAttendancePdf(archiveId);

        assertEquals("application/pdf", download.contentType());
        assertEquals(bytes.length, download.size());
        assertEquals("greenhill-academy-1-north-attendance-2026-10-02-to-2026-10-03.pdf",
                download.fileName());
        assertEquals(pdf, download.file());
        verify(objectStorage).getVerifiedTemporaryFile(
                "persisted/attendance.pdf", ArchiveHash.sha256(bytes), bytes.length);
    }

    @Test
    void deniesForeignAttendanceArchiveAndDoesNotAccessStorage() {
        UUID archiveId = UUID.randomUUID();
        UUID foreignSchool = UUID.randomUUID();
        UUID currentSchool = UUID.randomUUID();
        AttendanceArchive archive = verifiedAttendanceArchive(archiveId, foreignSchool);
        stubAttendanceLookup(archiveId, currentSchool, archive);

        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service().downloadAttendance(archiveId, "manifest"));
        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service().downloadAttendancePdf(archiveId));
        verify(objectStorage, never()).get(org.mockito.ArgumentMatchers.any());
        verify(objectStorage, never()).getVerifiedTemporaryFile(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void rejectsMissingAttendanceArtifactMetadata() {
        UUID archiveId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        stubAttendanceLookup(archiveId, schoolId, verifiedAttendanceArchive(archiveId, schoolId));

        assertThrows(ArchiveStorageUnavailableException.class,
                () -> service().downloadAttendance(archiveId, "snapshot"));
        assertThrows(ArchiveStorageUnavailableException.class,
                () -> service().downloadAttendance(archiveId, "manifest"));
        assertThrows(ArchiveStorageUnavailableException.class,
                () -> service().downloadAttendancePdf(archiveId));
    }

    @Test
    void doesNotReadR2ForArchiveOwnedByAnotherSchool() {
        UUID archiveId = UUID.randomUUID();
        UUID foreignSchoolId = UUID.randomUUID();
        UUID currentSchoolId = UUID.randomUUID();
        ResultArchive archive = new ResultArchive();
        archive.setSchoolId(foreignSchoolId);
        archive.setStatus(ArchiveStatus.VERIFIED);
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(currentSchoolId).build(), java.util.List.of()));
        when(resultArchiveRepository.findById(archiveId)).thenReturn(Optional.of(archive));

        ArchiveDocumentService service = new ArchiveDocumentService(
                resultArchiveRepository, attendanceArchiveRepository, resultArchiveStudentRepository,
                authenticatedUserService, objectStorage);

        assertThrows(SchoolResourceNotFoundExceptionHandler.class, () -> service.download(archiveId, "pdf"));
        verify(objectStorage, never()).get(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deniesLegacyArchiveWithNoSchoolOwner() {
        UUID archiveId = UUID.randomUUID();
        ResultArchive legacyArchive = new ResultArchive();
        legacyArchive.setSchoolId(null);
        legacyArchive.setStatus(ArchiveStatus.VERIFIED);
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(UUID.randomUUID()).build(), java.util.List.of()));
        when(resultArchiveRepository.findById(archiveId)).thenReturn(Optional.of(legacyArchive));

        ArchiveDocumentService service = new ArchiveDocumentService(
                resultArchiveRepository, attendanceArchiveRepository, resultArchiveStudentRepository,
                authenticatedUserService, objectStorage);

        assertThrows(SchoolResourceNotFoundExceptionHandler.class, () -> service.download(archiveId, "pdf"));
        verify(objectStorage, never()).get(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void deniesForeignClassStudentJsonAndAttendanceArtifactsBeforeStorageReads() {
        UUID archiveId = UUID.randomUUID();
        UUID foreignSchoolId = UUID.randomUUID();
        UUID currentSchoolId = UUID.randomUUID();
        ResultArchive result = new ResultArchive();
        result.setSchoolId(foreignSchoolId);
        result.setStatus(ArchiveStatus.VERIFIED);
        com.example.school.system.models.AttendanceArchive attendance =
                new com.example.school.system.models.AttendanceArchive();
        attendance.setSchoolId(foreignSchoolId);
        attendance.setStatus(ArchiveStatus.VERIFIED);
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(currentSchoolId).build(), java.util.List.of()));
        when(resultArchiveRepository.findById(archiveId)).thenReturn(Optional.of(result));
        when(attendanceArchiveRepository.findById(archiveId)).thenReturn(Optional.of(attendance));

        ArchiveDocumentService service = new ArchiveDocumentService(
                resultArchiveRepository, attendanceArchiveRepository, resultArchiveStudentRepository,
                authenticatedUserService, objectStorage);

        assertThrows(SchoolResourceNotFoundExceptionHandler.class, () -> service.download(archiveId, "manifest"));
        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service.downloadStudent(archiveId, UUID.randomUUID(), "snapshot"));
        assertThrows(SchoolResourceNotFoundExceptionHandler.class,
                () -> service.downloadPdf(archiveId, UUID.randomUUID()));
        verify(objectStorage, never()).get(org.mockito.ArgumentMatchers.any());
        verify(objectStorage, never()).getVerifiedTemporaryFile(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyLong());
    }

    private ArchiveDocumentService service() {
        return new ArchiveDocumentService(
                resultArchiveRepository, attendanceArchiveRepository, resultArchiveStudentRepository,
                authenticatedUserService, objectStorage);
    }

    private void stubAttendanceLookup(UUID archiveId, UUID schoolId, AttendanceArchive archive) {
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), java.util.List.of()));
        when(attendanceArchiveRepository.findById(archiveId)).thenReturn(Optional.of(archive));
    }

    private AttendanceArchive verifiedAttendanceArchive(UUID archiveId, UUID schoolId) {
        AttendanceArchive archive = new AttendanceArchive();
        archive.setId(archiveId);
        archive.setSchoolId(schoolId);
        archive.setClassId(UUID.randomUUID());
        archive.setSchoolName("Greenhill Academy");
        archive.setClassName("1 North");
        archive.setStartDate(LocalDate.parse("2026-10-02"));
        archive.setEndDate(LocalDate.parse("2026-10-03"));
        archive.setVersion(1);
        archive.setStatus(ArchiveStatus.VERIFIED);
        return archive;
    }
}
