package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.DTO.archive.FrozenResultArchiveSnapshot;
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
        try (com.lowagie.text.pdf.PdfReader reader = new com.lowagie.text.pdf.PdfReader(pdf)) {
            com.lowagie.text.pdf.parser.PdfTextExtractor extractor =
                    new com.lowagie.text.pdf.parser.PdfTextExtractor(reader);
            String content = java.util.stream.IntStream.rangeClosed(1, reader.getNumberOfPages())
                    .mapToObj(page -> {
                        try {
                            return extractor.getTextFromPage(page);
                        } catch (java.io.IOException exception) {
                            throw new IllegalStateException(exception);
                        }
                    })
                    .collect(java.util.stream.Collectors.joining("\n"));
            String normalizedContent = content.replaceAll("\\s+", "");
            for (String expected : List.of(
                    "Jane Doe", "ADM-42", "Example School", "12 School Road",
                    "Grade 6 East", "2026 Term 1", "Mathematics", "91", "EE1",
                    "91.0", "Teacher One", "Exceeding Expectations", "Keep progressing.",
                    "Maintain focus.", "40")) {
                assertTrue(normalizedContent.contains(expected.replaceAll("\\s+", "")),
                        "PDF should contain: " + expected + "\nExtracted:\n" + content);
            }
            assertTrue(!normalizedContent.contains("Present0"));
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
