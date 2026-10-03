package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

import com.example.school.system.DTO.DTOResponse.AuthenticatedUserContext;
import com.example.school.system.DTO.UserDto;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;

@ExtendWith(MockitoExtension.class)
class ArchiveRequestServiceListTest {
    @Mock private AuthenticatedUserService authenticatedUserService;
    @Mock private SchoolClassRepository schoolClassRepository;
    @Mock private SchoolSettingsRepository schoolSettingsRepository;
    @Mock private SubjectJointRepo subjectJointRepo;
    @Mock private StudentRepository studentRepository;
    @Mock private StudentSubjectSelectionRepo studentSubjectSelectionRepo;
    @Mock private MarksSheetRepo marksSheetRepo;
    @Mock private MarksRepo marksRepo;
    @Mock private ClassTermResultsRepo classTermResultsRepo;
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private ResultArchiveStudentRepository resultArchiveStudentRepository;
    @Mock private AttendanceSheetRepository attendanceSheetRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ArchiveSnapshotFactory archiveSnapshotFactory;

    @Test
    void returnsSchoolScopedAttendanceArchivesUsingListFilters() {
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        UUID archiveId = UUID.randomUUID();
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), List.of()));
        AttendanceArchive archive = new AttendanceArchive();
        archive.setId(archiveId);
        archive.setSchoolId(schoolId);
        archive.setClassId(classId);
        archive.setClassName("1 North");
        archive.setSchoolName("Greenhill Academy");
        archive.setStartDate(LocalDate.parse("2026-10-02"));
        archive.setEndDate(LocalDate.parse("2026-10-03"));
        archive.setVersion(1);
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setRequestedAt(Instant.parse("2026-10-03T08:00:00Z"));
        archive.setStudentCount(3);
        archive.setRecordedDays(1);
        archive.setNoSheetDays(1);
        archive.setAttendanceRate(100.0);
        when(attendanceArchiveRepository.searchArchives(
                org.mockito.ArgumentMatchers.eq(schoolId),
                org.mockito.ArgumentMatchers.eq(classId),
                org.mockito.ArgumentMatchers.eq(2026),
                org.mockito.ArgumentMatchers.eq(ArchiveStatus.VERIFIED),
                org.mockito.ArgumentMatchers.eq("Greenhill"),
                org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(List.of(archive));

        var page = service().listArchives(
                0, 20, "attendance", "2026", null, classId, "verified", " Greenhill ");

        assertEquals(1, page.content().size());
        assertEquals("ATTENDANCE", page.content().get(0).type());
        assertEquals(3, page.content().get(0).studentCount());
        assertEquals(1, page.content().get(0).recordedDays());
        assertEquals(100.0, page.content().get(0).attendanceRate());
        assertEquals(false, page.hasNext());
        verify(resultArchiveRepository, never()).searchArchives(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(Pageable.class));
    }

    @Test
    void rejectsUnsupportedTypeBeforeQueryingEitherArchiveSource() {
        UUID schoolId = UUID.randomUUID();
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), List.of()));

        assertThrows(SchoolResourceBadInputExceptionHandler.class,
                () -> service().listArchives(0, 20, "MARKS", null, null, null, null, null));
        verify(resultArchiveRepository, never()).searchArchives(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(Pageable.class));
        verify(attendanceArchiveRepository, never()).searchArchives(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(Pageable.class));
    }

    @Test
    void listsFrozenResultArchiveMetadataAndLoadsStudentCountsInOneBatch() {
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        UUID archiveId = UUID.randomUUID();
        when(authenticatedUserService.currentUser()).thenReturn(new AuthenticatedUserContext(
                UserDto.builder().schoolId(schoolId).build(), List.of()));
        ResultArchive archive = new ResultArchive();
        archive.setId(archiveId);
        archive.setSchoolId(schoolId);
        archive.setClassId(classId);
        archive.setClassName("Grade 6 North");
        archive.setAcademicYear("2026");
        archive.setTerm(2);
        archive.setExamType(ExamType.ENDTERM);
        archive.setVersion(1);
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setRequestedAt(Instant.parse("2026-10-02T08:00:00Z"));
        when(resultArchiveRepository.searchArchives(
                org.mockito.ArgumentMatchers.eq(schoolId),
                org.mockito.ArgumentMatchers.eq(classId),
                org.mockito.ArgumentMatchers.eq("2026"),
                org.mockito.ArgumentMatchers.eq(2),
                org.mockito.ArgumentMatchers.eq(ArchiveStatus.VERIFIED),
                org.mockito.ArgumentMatchers.eq("North"),
                org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(List.of(archive));
        when(resultArchiveStudentRepository.countByArchiveIds(List.of(archiveId)))
                .thenReturn(List.of(new ResultArchiveStudentRepository.ArchiveStudentCount() {
                    @Override
                    public UUID getArchiveId() {
                        return archiveId;
                    }

                    @Override
                    public Long getStudentCount() {
                        return 42L;
                    }
                }));

        var page = service().listArchives(
                0, 20, "RESULT", "2026", 2, classId, "VERIFIED", "North");

        assertEquals("RESULT", page.content().get(0).type());
        assertEquals("Grade 6 North", page.content().get(0).className());
        assertEquals(42, page.content().get(0).studentCount());
        verify(attendanceArchiveRepository, never()).searchArchives(
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(Pageable.class));
    }

    private ArchiveRequestService service() {
        return new ArchiveRequestService(
                authenticatedUserService, schoolClassRepository, schoolSettingsRepository, subjectJointRepo,
                studentRepository, studentSubjectSelectionRepo, marksSheetRepo, marksRepo, classTermResultsRepo,
                resultArchiveRepository, resultArchiveStudentRepository, attendanceSheetRepository,
                attendanceArchiveRepository, archiveSnapshotFactory);
    }
}
