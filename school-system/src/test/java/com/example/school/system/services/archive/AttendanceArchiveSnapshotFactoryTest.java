package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.AttendanceRecords;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.services.GradingService;
import com.example.school.system.services.ResultAccessService;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.ClassAttendanceStatus;
import com.example.school.system.types.WholeAttendanceSheetStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@ExtendWith(MockitoExtension.class)
class AttendanceArchiveSnapshotFactoryTest {
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ClassTermResultsRepo classTermResultsRepo;
    @Mock private MarksSheetRepo marksSheetRepo;
    @Mock private AttendanceSheetRepository attendanceSheetRepository;
    @Mock private ResultAccessService resultAccessService;
    @Mock private GradingService gradingService;

    @Test
    void buildsJsonPdfAndManifestFromOneHistoricalAttendanceSnapshot() throws Exception {
        UUID archiveId = UUID.randomUUID();
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        LocalDate recordedDate = LocalDate.parse("2026-10-02");
        LocalDate noSheetDate = LocalDate.parse("2026-10-03");
        AttendanceArchive archive = new AttendanceArchive();
        archive.setId(archiveId);
        archive.setSchoolId(schoolId);
        archive.setClassId(classId);
        archive.setSchoolName("Greenhill Academy");
        archive.setClassName("1 North");
        archive.setStartDate(recordedDate);
        archive.setEndDate(noSheetDate);
        archive.setMissingDatesConfirmed(true);
        archive.setVersion(1);
        archive.setStatus(ArchiveStatus.PROCESSING);
        archive.setRequestedAt(Instant.parse("2026-10-03T08:00:00Z"));
        when(attendanceArchiveRepository.findById(archiveId)).thenReturn(Optional.of(archive));

        School school = new School();
        school.setId(schoolId);
        school.setSchoolName("Current mutated school name");
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setClassId(classId);
        schoolClass.setClassGrade(9);
        schoolClass.setClassStream("South");
        schoolClass.setSchool(school);

        AttendanceSheet sheet = new AttendanceSheet();
        sheet.setDate(recordedDate);
        sheet.setStatus(WholeAttendanceSheetStatus.LOCKED);
        sheet.setSchoolClass(schoolClass);
        sheet.setAttendanceRecords(List.of(
                attendanceRecord(UUID.randomUUID(), "Amina", "ADM-1", ClassAttendanceStatus.PRESENT),
                attendanceRecord(UUID.randomUUID(), "Jakes", "ADM-2", ClassAttendanceStatus.PRESENT),
                attendanceRecord(UUID.randomUUID(), "James", "ADM-3", ClassAttendanceStatus.PRESENT)));
        when(attendanceSheetRepository.findAllBySchoolClassClassIdAndDateBetweenOrderByDate(
                classId, recordedDate, noSheetDate)).thenReturn(List.of(sheet));

        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        ArchiveSnapshotFactory factory = new ArchiveSnapshotFactory(
                mapper, resultArchiveRepository, attendanceArchiveRepository,
                classTermResultsRepo, marksSheetRepo, attendanceSheetRepository,
                resultAccessService, gradingService, new ArchivePdfGenerator());

        ArchiveSnapshotFactory.AttendancePayload payload = factory.buildAttendance(archiveId, UUID.randomUUID());
        JsonNode snapshot = mapper.readTree(payload.snapshot());
        JsonNode manifest = mapper.readTree(payload.manifest());

        assertEquals("Greenhill Academy", snapshot.path("schoolName").asText());
        assertEquals("1 North", snapshot.path("className").asText());
        assertEquals(1, snapshot.path("days").size());
        assertEquals(1, snapshot.path("missingDates").size());
        JsonNode missingDate = snapshot.path("missingDates").get(0);
        assertLocalDate(missingDate, noSheetDate);
        assertEquals(3, snapshot.path("studentSummaries").size());
        assertEquals(3, payload.studentCount());
        assertEquals(1, payload.recordedDays());
        assertEquals(1, payload.noSheetDays());
        assertEquals(100.0, payload.attendanceRate());

        JsonNode artifacts = manifest.path("artifacts");
        assertEquals(payload.snapshotKey(), artifact(artifacts, "ATTENDANCE_SNAPSHOT").path("objectKey").asText());
        assertEquals(payload.documentKey(), artifact(artifacts, "ATTENDANCE_PDF").path("objectKey").asText());
        assertEquals(payload.snapshot().length,
                artifact(artifacts, "ATTENDANCE_SNAPSHOT").path("size").asInt());
        assertEquals(ArchiveHash.sha256(payload.snapshot()),
                artifact(artifacts, "ATTENDANCE_SNAPSHOT").path("sha256").asText());
        assertEquals(payload.document().length, artifact(artifacts, "ATTENDANCE_PDF").path("size").asInt());
        assertEquals(ArchiveHash.sha256(payload.document()),
                artifact(artifacts, "ATTENDANCE_PDF").path("sha256").asText());

        try (com.lowagie.text.pdf.PdfReader reader =
                new com.lowagie.text.pdf.PdfReader(payload.document())) {
            String content = new com.lowagie.text.pdf.parser.PdfTextExtractor(reader).getTextFromPage(1);
            assertTrue(content.contains("GREENHILL ACADEMY"));
            assertTrue(content.contains("1 North"));
            assertTrue(content.contains("Amina"));
            assertTrue(content.contains("Jakes"));
            assertTrue(content.contains("James"));
            assertTrue(content.toLowerCase(java.util.Locale.ROOT).contains("no attendance sheet"));
            assertFalse(content.contains("STUDENT TOTAL"));
        }
    }

    private AttendanceRecords attendanceRecord(
            UUID studentId, String name, String admission, ClassAttendanceStatus status) {
        StudentProfile student = new StudentProfile();
        student.setId(studentId);
        student.setStudentFullName(name);
        student.setStudentAdm(admission);
        AttendanceRecords record = new AttendanceRecords();
        record.setStudent(student);
        record.setStatus(status);
        return record;
    }

    private JsonNode artifact(JsonNode artifacts, String type) {
        for (JsonNode artifact : artifacts) {
            if (type.equals(artifact.path("type").asText())) {
                return artifact;
            }
        }
        throw new AssertionError("Missing manifest artifact " + type);
    }

    private void assertLocalDate(JsonNode actual, LocalDate expected) {
        if (actual.isArray()) {
            assertEquals(expected.getYear(), actual.get(0).asInt());
            assertEquals(expected.getMonthValue(), actual.get(1).asInt());
            assertEquals(expected.getDayOfMonth(), actual.get(2).asInt());
            return;
        }
        assertEquals(expected.toString(), actual.asText());
    }
}
