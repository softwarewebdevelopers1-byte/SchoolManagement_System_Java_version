package com.example.school.system.controller;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.asyncDispatch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.example.school.system.DTO.archive.ArchiveDownload;
import com.example.school.system.DTO.archive.ArchiveFileDownload;
import com.example.school.system.services.archive.ArchiveDocumentService;

class AttendanceArchiveDownloadControllerTest {
    @Test
    @SuppressWarnings("unchecked")
    void mvcWritesClassStudentAndAttendancePdfStreams(@TempDir Path tempDir) throws Exception {
        UUID archiveId = UUID.randomUUID();
        UUID studentId = UUID.randomUUID();
        byte[] classPdf = "%PDF-class".getBytes(StandardCharsets.US_ASCII);
        byte[] studentPdf = "%PDF-student".getBytes(StandardCharsets.US_ASCII);
        byte[] attendancePdf = "%PDF-attendance".getBytes(StandardCharsets.US_ASCII);
        Path classFile = tempDir.resolve("class.pdf");
        Path studentFile = tempDir.resolve("student.pdf");
        Path attendanceFile = tempDir.resolve("attendance.pdf");
        Files.write(classFile, classPdf);
        Files.write(studentFile, studentPdf);
        Files.write(attendanceFile, attendancePdf);

        ArchiveDocumentService service = org.mockito.Mockito.mock(ArchiveDocumentService.class);
        ObjectProvider<ArchiveDocumentService> documents = org.mockito.Mockito.mock(ObjectProvider.class);
        ObjectProvider<com.example.school.system.services.archive.ArchiveRequestService> requests =
                org.mockito.Mockito.mock(ObjectProvider.class);
        when(documents.getIfAvailable()).thenReturn(service);
        when(service.downloadPdf(archiveId, null)).thenReturn(new ArchiveFileDownload(
                classFile, classPdf.length, "application/pdf", "class-results.pdf"));
        when(service.downloadPdf(archiveId, studentId)).thenReturn(new ArchiveFileDownload(
                studentFile, studentPdf.length, "application/pdf", "student-results.pdf"));
        when(service.downloadAttendancePdf(archiveId)).thenReturn(new ArchiveFileDownload(
                attendanceFile, attendancePdf.length, "application/pdf", "attendance.pdf"));
        MockMvc mvc = MockMvcBuilders.standaloneSetup(new ArchiveController(requests, documents)).build();

        assertPdfResponse(mvc,
                get("/api/school/archives/{archiveId}/pdf", archiveId).queryParam("disposition", "inline"),
                classPdf, "inline");
        assertPdfResponse(mvc,
                get("/api/school/archives/{archiveId}/students/{studentId}/pdf", archiveId, studentId),
                studentPdf, "attachment");
        assertPdfResponse(mvc,
                get("/api/school/attendance-archives/{archiveId}/pdf", archiveId),
                attendancePdf, "attachment");
    }

    @Test
    @SuppressWarnings("unchecked")
    void streamsPdfWithDownloadHeadersAndDeletesTemporaryFile(@TempDir Path tempDir) throws Exception {
        UUID archiveId = UUID.randomUUID();
        byte[] pdfBytes = "%PDF-attendance".getBytes(StandardCharsets.US_ASCII);
        Path pdf = tempDir.resolve("attendance.pdf");
        Files.write(pdf, pdfBytes);
        ArchiveDocumentService service = org.mockito.Mockito.mock(ArchiveDocumentService.class);
        ObjectProvider<ArchiveDocumentService> documents = org.mockito.Mockito.mock(ObjectProvider.class);
        ObjectProvider<com.example.school.system.services.archive.ArchiveRequestService> requests =
                org.mockito.Mockito.mock(ObjectProvider.class);
        when(documents.getIfAvailable()).thenReturn(service);
        when(service.downloadAttendancePdf(archiveId)).thenReturn(new ArchiveFileDownload(
                pdf, pdfBytes.length, "application/pdf", "greenhill-1-north-attendance.pdf"));
        ArchiveController controller = new ArchiveController(requests, documents);

        var response = controller.downloadAttendance(archiveId, "pdf", "attachment");
        var body = (StreamingResponseBody) response.getBody();
        java.io.ByteArrayOutputStream output = new java.io.ByteArrayOutputStream();
        body.writeTo(output);

        assertEquals(200, response.getStatusCode().value());
        assertEquals("application/pdf", response.getHeaders().getContentType().toString());
        assertEquals((long) pdfBytes.length, response.getHeaders().getContentLength());
        assertEquals("attachment; filename=\"greenhill-1-north-attendance.pdf\"",
                response.getHeaders().getFirst("Content-Disposition"));
        assertArrayEquals(pdfBytes, output.toByteArray());
        assertFalse(Files.exists(pdf));
        verify(service).downloadAttendancePdf(archiveId);
    }

    @Test
    @SuppressWarnings("unchecked")
    void sendsSnapshotAndManifestAsJsonAttachments() {
        UUID archiveId = UUID.randomUUID();
        byte[] snapshot = "{\"days\":[]}".getBytes(StandardCharsets.UTF_8);
        ArchiveDocumentService service = org.mockito.Mockito.mock(ArchiveDocumentService.class);
        ObjectProvider<ArchiveDocumentService> documents = org.mockito.Mockito.mock(ObjectProvider.class);
        ObjectProvider<com.example.school.system.services.archive.ArchiveRequestService> requests =
                org.mockito.Mockito.mock(ObjectProvider.class);
        when(documents.getIfAvailable()).thenReturn(service);
        when(service.downloadAttendance(archiveId, "snapshot"))
                .thenReturn(new ArchiveDownload(snapshot, "application/json", "attendance-snapshot.json"));
        when(service.downloadAttendance(archiveId, "manifest"))
                .thenReturn(new ArchiveDownload(snapshot, "application/json", "attendance-manifest.json"));
        ArchiveController controller = new ArchiveController(requests, documents);

        var snapshotResponse = controller.downloadAttendance(archiveId, "snapshot", "attachment");
        var manifestResponse = controller.downloadAttendance(archiveId, "manifest", "attachment");

        assertEquals("application/json", snapshotResponse.getHeaders().getContentType().toString());
        assertEquals("attachment; filename=\"attendance-snapshot.json\"",
                snapshotResponse.getHeaders().getFirst("Content-Disposition"));
        assertArrayEquals(snapshot, responseBytes(snapshotResponse.getBody()));
        assertEquals("attachment; filename=\"attendance-manifest.json\"",
                manifestResponse.getHeaders().getFirst("Content-Disposition"));
        assertArrayEquals(snapshot, responseBytes(manifestResponse.getBody()));
        verify(service).downloadAttendance(archiveId, "snapshot");
        verify(service).downloadAttendance(archiveId, "manifest");
    }

    private void assertPdfResponse(
            MockMvc mvc, MockHttpServletRequestBuilder requestBuilder, byte[] expected, String disposition)
            throws Exception {
        MvcResult asyncResult = mvc.perform(requestBuilder)
                .andExpect(request().asyncStarted())
                .andReturn();
        mvc.perform(asyncDispatch(asyncResult))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/pdf"))
                .andExpect(content().bytes(expected))
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Disposition", org.hamcrest.Matchers.startsWith(disposition + ";")));
    }

    private byte[] responseBytes(StreamingResponseBody body) {
        java.io.ByteArrayOutputStream output = new java.io.ByteArrayOutputStream();
        try {
            body.writeTo(output);
        } catch (java.io.IOException exception) {
            throw new IllegalStateException(exception);
        }
        return output.toByteArray();
    }
}
