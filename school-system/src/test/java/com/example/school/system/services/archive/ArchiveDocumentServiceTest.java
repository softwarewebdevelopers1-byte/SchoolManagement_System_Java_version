package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.DTO.DTOResponse.AuthenticatedUserContext;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.types.ArchiveStatus;

@ExtendWith(MockitoExtension.class)
class ArchiveDocumentServiceTest {
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ResultArchiveStudentRepository resultArchiveStudentRepository;
    @Mock private AuthenticatedUserService authenticatedUserService;
    @Mock private R2ObjectStorage objectStorage;

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
}
