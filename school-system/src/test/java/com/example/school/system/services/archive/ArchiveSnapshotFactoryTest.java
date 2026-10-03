package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.DTO.archive.FrozenResultArchiveSnapshot;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.services.GradingService;
import com.example.school.system.services.ResultAccessService;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ExamType;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class ArchiveSnapshotFactoryTest {
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ClassTermResultsRepo classTermResultsRepo;
    @Mock private MarksSheetRepo marksSheetRepo;
    @Mock private AttendanceSheetRepository attendanceSheetRepository;
    @Mock private ResultAccessService resultAccessService;
    @Mock private GradingService gradingService;

    @Test
    void workerUsesFrozenSnapshotWithoutQueryingCurrentAcademicRelationships() throws Exception {
        UUID archiveId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        ParentResultsResponse historicalResult = new ParentResultsResponse(
                new ParentResultsResponse.Student(
                        studentId, "Historical Student", "ADM-6", "6", "Grade 6 East",
                        null, 87.0, "EE1", 1, 20),
                new ParentResultsResponse.School("Historical School", null, null, null, null),
                new ParentResultsResponse.Term("2026-1-OPENER", "2026 Term 1 (OPENER)",
                        null, null, "OPENER", null),
                List.of(), new ParentResultsResponse.Summary(87, 87.0, "EE1"),
                new ParentResultsResponse.Attendance(0, 0, 0, 0), null, null, null);
        ArchivedStudentResultSnapshot studentSnapshot = new ArchivedStudentResultSnapshot(
                historicalResult, List.of(), List.of(), "Historical address",
                Instant.parse("2026-02-01T10:00:00Z"), UUID.randomUUID());
        FrozenResultArchiveSnapshot frozen = new FrozenResultArchiveSnapshot(
                archiveId, 1, schoolId, "Historical School", "Historical address",
                "old@example.test", "+254700000000", "Old motto", classId, "Grade 6 East",
                "2026", 1, ExamType.OPENER, UUID.randomUUID(),
                Instant.parse("2026-02-01T10:00:00Z"), List.of(), List.of(studentSnapshot));
        ResultArchive archive = new ResultArchive();
        archive.setId(archiveId);
        archive.setSchoolId(schoolId);
        archive.setClassId(classId);
        archive.setClassName("Grade 6 East");
        archive.setAcademicYear("2026");
        archive.setTerm(1);
        archive.setExamType(ExamType.OPENER);
        archive.setVersion(1);
        archive.setStatus(ArchiveStatus.PROCESSING);
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        archive.setFrozenSnapshot(mapper.writeValueAsString(frozen));
        archive.setClassName("Current Class Name");
        archive.setAcademicYear("2027");
        archive.setTerm(3);
        archive.setExamType(ExamType.ENDTERM);
        when(resultArchiveRepository.findById(archiveId)).thenReturn(Optional.of(archive));

        ArchiveSnapshotFactory factory = new ArchiveSnapshotFactory(
                mapper, resultArchiveRepository, attendanceArchiveRepository,
                classTermResultsRepo, marksSheetRepo, attendanceSheetRepository,
                resultAccessService, gradingService, new ArchivePdfGenerator());

        ArchivePayload payload = factory.buildResult(archiveId);

        assertEquals("Historical School", payload.schoolName());
        assertEquals("Grade 6 East", payload.className());
        assertEquals("2026", payload.academicYear());
        assertEquals(1, payload.term());
        assertEquals(ExamType.OPENER, payload.examType());
        assertEquals("Historical Student", payload.students().getFirst().result().student().name());
        assertEquals("Historical address", payload.students().getFirst().schoolAddress());
        verify(classTermResultsRepo, never())
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
        verify(marksSheetRepo, never())
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatusIn(
                        org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.anyList());
        verify(resultAccessService, never()).buildSnapshotsFor(
                org.mockito.ArgumentMatchers.anyList(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any());
    }
}
