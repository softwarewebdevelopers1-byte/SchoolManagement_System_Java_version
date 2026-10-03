package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.archive.ArchiveDownload;
import com.example.school.system.DTO.archive.ArchivePageResponse;
import com.example.school.system.DTO.archive.ArchiveRecordResponse;
import com.example.school.system.DTO.archive.ArchiveStudentsPageResponse;
import com.example.school.system.DTO.archive.AttendanceArchivePreview;
import com.example.school.system.DTO.archive.AttendanceArchiveRequest;
import com.example.school.system.DTO.archive.ResultArchiveRequest;
import com.example.school.system.DTO.archive.ResultArchiveCorrectionRequest;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.archive.ArchiveDocumentService;
import com.example.school.system.services.archive.ArchiveRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;
import java.nio.file.Files;
import java.nio.file.Path;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ArchiveController {
    private final ObjectProvider<ArchiveRequestService> archiveRequestServiceProvider;
    private final ObjectProvider<ArchiveDocumentService> archiveDocumentServiceProvider;

    @GetMapping("/school/archives")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<?> getArchives(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String year,
            @RequestParam(required = false) Integer term,
            @RequestParam(required = false) UUID classId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        ArchivePageResponse response = requireArchiveService()
                .listArchives(page, size, type, year, term, classId, status, search);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "archives loaded"));
    }

    @PostMapping("/admin/archives/results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArchiveRecordResponse> requestResultArchive(
            @Valid @RequestBody ResultArchiveRequest request) {
        return ResponseEntity.accepted().body(requireArchiveService().requestResultArchive(request));
    }

    @PostMapping("/admin/archives/results/{archiveId}/corrections")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArchiveRecordResponse> requestResultCorrection(
            @PathVariable UUID archiveId,
            @Valid @RequestBody ResultArchiveCorrectionRequest request) {
        return ResponseEntity.accepted().body(
                requireArchiveService().requestResultCorrection(archiveId, request.reason()));
    }

    @PostMapping("/admin/archives/attendance")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArchiveRecordResponse> requestAttendanceArchive(
            @Valid @RequestBody AttendanceArchiveRequest request) {
        return ResponseEntity.accepted().body(requireArchiveService().requestAttendanceArchive(request));
    }

    @GetMapping("/admin/archives/attendance/preview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AttendanceArchivePreview> previewAttendanceArchive(
            @RequestParam UUID classId,
            @RequestParam java.time.LocalDate startDate,
            @RequestParam java.time.LocalDate endDate) {
        return ResponseEntity.ok(requireArchiveService().previewAttendanceArchive(
                new AttendanceArchiveRequest(classId, startDate, endDate)));
    }

    @PostMapping("/school/archives/{archiveId}/retry")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArchiveRecordResponse> retry(@PathVariable UUID archiveId) {
        return ResponseEntity.accepted().body(requireArchiveService().retry(archiveId));
    }

    @GetMapping("/school/archives/{archiveId}/{kind}")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<StreamingResponseBody> download(
            @PathVariable UUID archiveId,
            @PathVariable String kind,
            @RequestParam(defaultValue = "attachment") String disposition) {
        if (!kind.equalsIgnoreCase("pdf") && !kind.equalsIgnoreCase("snapshot")
                && !kind.equalsIgnoreCase("manifest")) {
            return ResponseEntity.badRequest().build();
        }
        ArchiveDocumentService documentService = archiveDocumentServiceProvider.getIfAvailable();
        if (documentService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archival storage is not configured");
        }
        if (kind.equalsIgnoreCase("pdf")) {
            var file = documentService.downloadPdf(archiveId, null);
            return stream(file.file(), file.size(), file.contentType(), file.fileName(), disposition);
        }
        ArchiveDownload file = documentService.download(archiveId, kind);
        return stream(file.content(), file.contentType(), file.fileName(), disposition);
    }

    @GetMapping("/school/attendance-archives/{archiveId}/{kind}")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<StreamingResponseBody> downloadAttendance(
            @PathVariable UUID archiveId,
            @PathVariable String kind,
            @RequestParam(defaultValue = "attachment") String disposition) {
        if (!kind.equalsIgnoreCase("pdf") && !kind.equalsIgnoreCase("snapshot")
                && !kind.equalsIgnoreCase("manifest")) {
            return ResponseEntity.badRequest().build();
        }
        ArchiveDocumentService documentService = archiveDocumentServiceProvider.getIfAvailable();
        if (documentService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archive documents are temporarily unavailable");
        }
        if (kind.equalsIgnoreCase("pdf")) {
            var file = documentService.downloadAttendancePdf(archiveId);
            return stream(file.file(), file.size(), file.contentType(), file.fileName(), disposition);
        }
        ArchiveDownload file = documentService.downloadAttendance(archiveId, kind);
        return stream(file.content(), file.contentType(), file.fileName(), "attachment");
    }

    @GetMapping("/school/archives/{archiveId}/students/{studentId}/{kind}")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<StreamingResponseBody> downloadStudent(
            @PathVariable UUID archiveId,
            @PathVariable UUID studentId,
            @PathVariable String kind,
            @RequestParam(defaultValue = "attachment") String disposition) {
        if (!kind.equalsIgnoreCase("pdf") && !kind.equalsIgnoreCase("snapshot")) {
            return ResponseEntity.badRequest().build();
        }
        ArchiveDocumentService documentService = archiveDocumentServiceProvider.getIfAvailable();
        if (documentService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archive documents are temporarily unavailable");
        }
        if (kind.equalsIgnoreCase("pdf")) {
            var file = documentService.downloadPdf(archiveId, studentId);
            return stream(file.file(), file.size(), file.contentType(), file.fileName(), disposition);
        }
        ArchiveDownload file = documentService.downloadStudent(archiveId, studentId, kind);
        return stream(file.content(), file.contentType(), file.fileName(), disposition);
    }

    @GetMapping("/school/archives/{archiveId}/students")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<ArchiveStudentsPageResponse> listArchiveStudents(
            @PathVariable UUID archiveId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        ArchiveDocumentService documentService = archiveDocumentServiceProvider.getIfAvailable();
        if (documentService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archive documents are temporarily unavailable");
        }
        return ResponseEntity.ok(documentService.listStudentArtifacts(archiveId, page, size));
    }

    private String contentDisposition(String disposition, String fileName) {
        String mode = "inline".equalsIgnoreCase(disposition) ? "inline" : "attachment";
        return mode + "; filename=\"" + fileName + "\"";
    }

    private ResponseEntity<StreamingResponseBody> stream(
            Path file, long size, String contentType, String fileName, String disposition) {
        StreamingResponseBody body = output -> {
            try (InputStream input = Files.newInputStream(file)) {
                input.transferTo(output);
            } finally {
                Files.deleteIfExists(file);
            }
        };
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(size)
                .header("Content-Disposition", contentDisposition(disposition, fileName))
                .body(body);
    }

    private ResponseEntity<StreamingResponseBody> stream(
            byte[] content, String contentType, String fileName, String disposition) {
        StreamingResponseBody body = output -> output.write(content);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .contentLength(content.length)
                .header("Content-Disposition", contentDisposition(disposition, fileName))
                .body(body);
    }

    private ArchiveRequestService requireArchiveService() {
        ArchiveRequestService service = archiveRequestServiceProvider.getIfAvailable();
        if (service == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archival storage is not configured");
        }
        return service;
    }
}
