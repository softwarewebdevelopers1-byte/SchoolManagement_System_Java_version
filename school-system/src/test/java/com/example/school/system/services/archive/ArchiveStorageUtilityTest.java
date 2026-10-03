package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.DTO.archive.AttendanceSnapshot;
import com.example.school.system.DTO.archive.FrozenResultArchiveSnapshot;
import com.example.school.system.types.ClassAttendanceStatus;
import com.example.school.system.types.WholeAttendanceSheetStatus;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

class ArchiveStorageUtilityTest {
    @Test
    void calculatesSha256ForExactBytes() {
        assertEquals(
                "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                ArchiveHash.sha256("abc".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void createsPdfBytesForAnArchiveReport() {
        byte[] pdf = new ArchivePdfGenerator().generate(
                "Test archive",
                List.of(new String[] { "Student", "Total" }, new String[] { "A Student", "80" }));

        assertTrue(new String(pdf, 0, 5, StandardCharsets.US_ASCII).startsWith("%PDF-"));
        assertTrue(pdf.length > 100);
    }

    @Test
    void studentArchivePdfContainsFrozenOfficialReportFields() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID subjectId = UUID.randomUUID();
        ParentResultsResponse result = new ParentResultsResponse(
                new ParentResultsResponse.Student(
                        studentId, "Jane Doe", "ADM-42", "6", "Grade 6 East",
                        null, 91.0, "EE1", 2, 24),
                new ParentResultsResponse.School(
                        "Example School", "office@example.test", "Learn Well", "+254700000000", null),
                new ParentResultsResponse.Term("2026-1-ENDTERM", "2026 Term 1 (ENDTERM)",
                        null, null, "ENDTERM", null),
                List.of(new ParentResultsResponse.SubjectResult(
                        subjectId, "Mathematics", 91, 100, "EE1", 8.0,
                        "Teacher One", "Excellent", 80.0, 11.0)),
                new ParentResultsResponse.Summary(91, 91.0, "EE1"),
                new ParentResultsResponse.Attendance(0, 0, 0, 0),
                "Keep progressing.", "Maintain focus.", null);
        ArchivedStudentResultSnapshot snapshot = new ArchivedStudentResultSnapshot(
                result,
                List.of(new ArchivedStudentResultSnapshot.Assessment(
                        subjectId, "Mathematics", "Teacher One", "ENDTERM",
                        40, 40, null, 91, 40, 40, null, 100,
                        91, 91, "EE1", 8.0, 1, 24)),
                List.of(new FrozenResultArchiveSnapshot.GradeDescriptor(
                        "EE1", 80, 100, 8.0, "Exceeding Expectations")),
                "12 School Road",
                java.time.Instant.parse("2026-10-03T08:00:00Z"),
                UUID.randomUUID());

        byte[] pdf = new ArchivePdfGenerator().generateStudentResult(snapshot);
        saveReviewPdf("student-report.pdf", pdf);
        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(pdf)) {
            String content = extractAllPages(reader);
            String normalizedContent = content.replaceAll("\\s+", "");
            for (String expected : List.of(
                    "Jane Doe", "ADM-42", "Example School", "12 School Road", "12 School Road",
                    "Grade 6 East", "2026", "Term 1", "End of Term Assessment", "Mathematics",
                    "91/100", "EE1", "91%", "8", "2nd", "24", "CAT 1", "CAT 2",
                    "EXAM", "80", "+11", "Teacher One", "Exceeding Expectations",
                    "Keep progressing.", "Maintain focus.")) {
                assertTrue(normalizedContent.contains(expected.replaceAll("\\s+", "")),
                        "PDF should contain: " + expected + "\nExtracted:\n" + content);
            }
            assertTrue(!normalizedContent.contains("DAYS PRESENT"));
            assertTrue(!normalizedContent.contains("CAT3"));
            assertTrue(!normalizedContent.contains("Assessment components"));
        }
    }

    @Test
    void classArchivePdfIsAReadableRankedReportAndPaginatesManySubjects() throws Exception {
        List<ArchivedStudentResultSnapshot> students = new ArrayList<>();
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        for (int studentIndex = 1; studentIndex <= 32; studentIndex++) {
            List<ParentResultsResponse.SubjectResult> subjects = new ArrayList<>();
            List<ArchivedStudentResultSnapshot.Assessment> assessments = new ArrayList<>();
            for (int subjectIndex = 1; subjectIndex <= 12; subjectIndex++) {
                UUID subjectId = UUID.nameUUIDFromBytes(
                        ("subject-" + subjectIndex).getBytes(StandardCharsets.UTF_8));
                int score = 58 + (studentIndex + subjectIndex) % 40;
                String subjectName = "Subject " + subjectIndex;
                subjects.add(new ParentResultsResponse.SubjectResult(
                        subjectId, subjectName, score, 100, score >= 80 ? "EE1" : "ME1",
                        score >= 80 ? 8.0 : 6.0, "Teacher " + subjectIndex, "Solid subject work.",
                        55.0, score - 55.0));
                assessments.add(new ArchivedStudentResultSnapshot.Assessment(
                        subjectId, subjectName, "Teacher " + subjectIndex, "ENDTERM",
                        20, 20, null, score - 40, 20, 20, null, 60,
                        score, score, score >= 80 ? "EE1" : "ME1",
                        score >= 80 ? 8.0 : 6.0, studentIndex, 32));
            }
            String longRemark = studentIndex == 1
                    ? "Consistent effort across the term. ".repeat(18)
                    : "Good progress.";
            ParentResultsResponse result = new ParentResultsResponse(
                    new ParentResultsResponse.Student(
                            UUID.randomUUID(), "Student " + studentIndex,
                            "ADM-" + studentIndex, "6", "Grade 6 North",
                            null, 60.0 + studentIndex, studentIndex == 1 ? "EE1" : "ME1",
                            studentIndex, 32),
                    new ParentResultsResponse.School(
                            "Greenhill Academy", "office@greenhill.test", "Learn well, lead kindly",
                            "+254700000000", null),
                    new ParentResultsResponse.Term(
                            "2026-2-ENDTERM", "2026 Term 2 (ENDTERM)", null, null, "ENDTERM", null),
                    subjects,
                    new ParentResultsResponse.Summary(900, 60.0 + studentIndex, "ME1"),
                    new ParentResultsResponse.Attendance(0, 0, 0, 0),
                    longRemark,
                    "Keep building confidence.", null);
            students.add(new ArchivedStudentResultSnapshot(
                    result, assessments,
                    List.of(new FrozenResultArchiveSnapshot.GradeDescriptor(
                            "EE1", 80, 100, 8, "Exceeding Expectations")),
                    "4 School Road", Instant.parse("2026-10-02T08:00:00Z"), UUID.randomUUID()));
        }
        ArchivePayload payload = new ArchivePayload(
                UUID.randomUUID(), 1, schoolId, classId, "Greenhill Academy", "Grade 6 North",
                "2026", 2, com.example.school.system.types.ExamType.ENDTERM,
                Instant.parse("2026-10-03T08:00:00Z"), "frozen/prefix", students);

        byte[] pdf = new ArchivePdfGenerator().generateClassResults(payload);
        saveReviewPdf("class-report.pdf", pdf);

        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(pdf)) {
            assertTrue(reader.getNumberOfPages() >= 5,
                    "class report should split subject groups and long student rosters across pages");
            String content = extractAllPages(reader);
            String normalized = content.replaceAll("\\s+", " ").toUpperCase(java.util.Locale.ROOT);
            for (String expected : List.of(
                    "GREENHILL ACADEMY", "CLASS RESULTS REPORT", "GRADE 6 NORTH",
                    "2026", "TERM 2", "END OF TERM ASSESSMENT", "CLASS OVERVIEW",
                    "STUDENTS", "SUBJECTS", "CLASS AVERAGE", "HIGHEST AVERAGE",
                    "LOWEST AVERAGE", "SUBJECT PERFORMANCE", "ASSESSED",
                    "STUDENT PERFORMANCE", "POS.", "STUDENT 1", "STUDENT 32",
                    "SUBJECT 12", "EE1", "STUDENT REMARKS", "TEACHER'S REMARK",
                    "HEADTEACHER'S REMARK", "PAGE 1", "PAGE " + reader.getNumberOfPages())) {
                assertTrue(normalized.contains(expected), "PDF should contain " + expected + "\n" + content);
            }
            assertTrue(normalized.contains("SUBJECTS 2 OF 3"));
            assertTrue(normalized.contains("SUBJECTS 3 OF 3"));
            assertTrue(!normalized.contains("SUBJECT ID"));
            assertTrue(!normalized.contains("OVERALL AVERAGE /"));
        }
    }

    @Test
    void studentPdfOmitsUnavailableValuesAndWrapsLongRemarks() throws Exception {
        List<ParentResultsResponse.SubjectResult> subjects = java.util.stream.IntStream.rangeClosed(1, 18)
                .mapToObj(index -> new ParentResultsResponse.SubjectResult(
                        UUID.randomUUID(), "Subject " + index, 70 + index, 100, "ME1",
                        null, null, null, null, null))
                .toList();
        ParentResultsResponse result = new ParentResultsResponse(
                new ParentResultsResponse.Student(
                        UUID.randomUUID(), "Amina Wanjiku With A Very Long Name",
                        "ADM-26-B7B18E76", null, "1 North", null,
                        73.5, "ME1", 11, 40),
                new ParentResultsResponse.School("Greenhill Academy", null, null, null, null),
                new ParentResultsResponse.Term(null, null, null, null, null, null),
                subjects,
                new ParentResultsResponse.Summary(null, 73.5, "ME1"),
                new ParentResultsResponse.Attendance(0, 0, 0, 0),
                "A detailed teacher remark. ".repeat(45),
                null, null);
        ArchivedStudentResultSnapshot snapshot = new ArchivedStudentResultSnapshot(
                result, List.of(), List.of(), null, null, null);

        byte[] pdf = new ArchivePdfGenerator().generateStudentResult(snapshot);
        saveReviewPdf("student-long-remarks.pdf", pdf);

        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(pdf)) {
            String content = extractAllPages(reader);
            assertTrue(content.contains("Amina Wanjiku With A Very Long Name"));
            assertTrue(content.contains("ADM-26-B7B18E76"));
            assertTrue(content.contains("Subject 18"));
            assertTrue(content.contains("73.5%"));
            assertTrue(content.contains("ME1"));
            assertTrue(content.contains("11th"));
            assertTrue(reader.getNumberOfPages() > 1);
            assertTrue(content.contains("A detailed teacher remark."));
            assertTrue(!content.contains("DAYS PRESENT"));
            assertTrue(!content.contains("HEADTEACHER'S REMARK"));
            assertTrue(!content.contains("Assessment components"));
        }
    }

    private String extractAllPages(com.lowagie.text.pdf.PdfReader reader) {
        com.lowagie.text.pdf.parser.PdfTextExtractor extractor =
                new com.lowagie.text.pdf.parser.PdfTextExtractor(reader);
        return java.util.stream.IntStream.rangeClosed(1, reader.getNumberOfPages())
                .mapToObj(page -> {
                    try {
                        return extractor.getTextFromPage(page);
                    } catch (java.io.IOException exception) {
                        throw new IllegalStateException(exception);
                    }
                })
                .collect(java.util.stream.Collectors.joining("\n"));
    }

    private void saveReviewPdf(String fileName, byte[] pdf) throws java.io.IOException {
        String directory = System.getProperty("results.pdf.reviewDir");
        if (directory != null) {
            Path target = Path.of(directory);
            Files.createDirectories(target);
            Files.write(target.resolve(fileName), pdf);
        }
    }

    @Test
    void attendancePdfShowsOverviewMatrixAndNoSheetWithoutStudentTotals() throws Exception {
        UUID aminaId = UUID.randomUUID();
        UUID jakesId = UUID.randomUUID();
        UUID jamesId = UUID.randomUUID();
        java.time.LocalDate recordedDate = java.time.LocalDate.parse("2026-10-02");
        java.time.LocalDate noSheetDate = java.time.LocalDate.parse("2026-10-03");
        List<AttendanceSnapshot.StudentSummary> summaries = List.of(
                new AttendanceSnapshot.StudentSummary(aminaId, "Amina", "ADM-1", 1, 0, 1, 100),
                new AttendanceSnapshot.StudentSummary(jakesId, "Jakes", "ADM-2", 1, 0, 1, 100),
                new AttendanceSnapshot.StudentSummary(jamesId, "James", "ADM-3", 1, 0, 1, 100));
        AttendanceSnapshot snapshot = new AttendanceSnapshot(
                UUID.randomUUID(), "Greenhill Academy", UUID.randomUUID(), "1 North",
                recordedDate, noSheetDate, true, List.of(noSheetDate),
                List.of(new AttendanceSnapshot.Day(
                        recordedDate, WholeAttendanceSheetStatus.LOCKED, 3, 0, 100,
                        List.of(
                                new AttendanceSnapshot.StudentRecord(aminaId, "Amina", "ADM-1", ClassAttendanceStatus.PRESENT),
                                new AttendanceSnapshot.StudentRecord(jakesId, "Jakes", "ADM-2", ClassAttendanceStatus.PRESENT),
                                new AttendanceSnapshot.StudentRecord(jamesId, "James", "ADM-3", ClassAttendanceStatus.PRESENT)))),
                summaries);

        byte[] pdf = new ArchivePdfGenerator().generateAttendanceReport(
                snapshot, 1, java.time.Instant.parse("2026-10-03T08:00:00Z"));

        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(pdf)) {
            String content = new com.lowagie.text.pdf.parser.PdfTextExtractor(reader).getTextFromPage(1);
            String normalized = content.toUpperCase(java.util.Locale.ROOT).replaceAll("\\s+", " ");
            for (String required : List.of(
                    "GREENHILL ACADEMY", "ATTENDANCE REPORT", "CLASS 1 NORTH",
                    "02 OCT 2026", "03 OCT 2026", "STUDENTS", "RECORDED DAYS",
                    "NO-SHEET DAYS", "ATTENDANCE RATE", "AMINA", "JAKES", "JAMES",
                    "PRESENT", "NO ATTENDANCE SHEET")) {
                assertTrue(normalized.contains(required), "PDF should contain " + required + ": " + content);
            }
            assertTrue(!normalized.contains("STUDENT TOTAL"));
            assertTrue(!normalized.contains("ABSENT 0"));
        }
    }

    @Test
    void attendancePdfPaginatesLargeClassesAndDateRanges() throws Exception {
        java.time.LocalDate start = java.time.LocalDate.parse("2026-10-01");
        List<java.time.LocalDate> dates = java.util.stream.IntStream.range(0, 12)
                .mapToObj(start::plusDays)
                .toList();
        java.time.LocalDate missingDate = dates.get(5);
        List<AttendanceSnapshot.StudentSummary> students = java.util.stream.IntStream.range(0, 60)
                .mapToObj(index -> new AttendanceSnapshot.StudentSummary(
                        UUID.nameUUIDFromBytes(("student-" + index).getBytes(StandardCharsets.UTF_8)),
                        "Student " + index, "ADM-" + index, 6, 5, 11, 54.5))
                .toList();
        List<AttendanceSnapshot.Day> days = dates.stream()
                .filter(date -> !date.equals(missingDate))
                .map(date -> new AttendanceSnapshot.Day(
                        date, WholeAttendanceSheetStatus.LOCKED, 30, 30, 50,
                        students.stream()
                                .map(student -> new AttendanceSnapshot.StudentRecord(
                                        student.studentId(), student.name(), student.admissionNumber(),
                                        Integer.parseInt(student.admissionNumber().substring(4)) % 2 == 0
                                                ? ClassAttendanceStatus.PRESENT : ClassAttendanceStatus.ABSENT))
                                .toList()))
                .toList();
        AttendanceSnapshot snapshot = new AttendanceSnapshot(
                UUID.randomUUID(), "Greenhill Academy", UUID.randomUUID(), "1 North",
                start, dates.getLast(), true, List.of(missingDate), days, students);

        byte[] pdf = new ArchivePdfGenerator().generateAttendanceReport(snapshot, 2, java.time.Instant.now());

        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(pdf)) {
            assertTrue(reader.getNumberOfPages() > 2, "large report should paginate by dates and students");
            String content = java.util.stream.IntStream.rangeClosed(1, reader.getNumberOfPages())
                    .mapToObj(page -> {
                        try {
                            return new com.lowagie.text.pdf.parser.PdfTextExtractor(reader).getTextFromPage(page);
                        } catch (java.io.IOException exception) {
                            throw new IllegalStateException(exception);
                        }
                    })
                    .collect(java.util.stream.Collectors.joining("\n"));
            assertTrue(content.contains("Student 59"));
            assertTrue(content.contains("Page 1"));
            assertTrue(content.contains("Page " + reader.getNumberOfPages()));
            assertTrue(!content.contains("STUDENT TOTAL"));
        }
    }

    @Test
    void returnsSafeControlledErrorWhenR2ReadIsUnavailable() {
        S3Client client = org.mockito.Mockito.mock(S3Client.class);
        when(client.getObject(any(GetObjectRequest.class)))
                .thenThrow(SdkClientException.create("private endpoint failure"));
        ArchiveStorageUnavailableException exception = assertThrows(
                ArchiveStorageUnavailableException.class,
                () -> new R2ObjectStorage(client, "private-test-bucket").get("private/key"));

        assertEquals("The archive document is temporarily unavailable. Please try again later.",
                exception.getMessage());
        assertTrue(!exception.getMessage().contains("endpoint"));
    }
}
