package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.core.io.ByteArrayResource;
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
import com.example.school.system.DTO.archive.ArchiveRecordResponse;
import com.example.school.system.DTO.archive.AttendanceArchivePreview;
import com.example.school.system.DTO.archive.AttendanceArchiveRequest;
import com.example.school.system.DTO.archive.ResultArchiveRequest;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.archive.ArchiveDocumentService;
import com.example.school.system.services.archive.ArchiveRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ArchiveController {
    private final ObjectProvider<ArchiveRequestService> archiveRequestServiceProvider;
    private final ObjectProvider<ArchiveDocumentService> archiveDocumentServiceProvider;

    @GetMapping("/school/archives")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<?> getArchives() {
        ArchiveRequestService service = archiveRequestServiceProvider.getIfAvailable();
        return ResponseEntity.ok(SchoolApiResponse.success(
                service == null ? java.util.List.of() : service.listArchives(), "archives loaded"));
    }

    @PostMapping("/admin/archives/results")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ArchiveRecordResponse> requestResultArchive(
            @Valid @RequestBody ResultArchiveRequest request) {
        return ResponseEntity.accepted().body(requireArchiveService().requestResultArchive(request));
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
    public ResponseEntity<ByteArrayResource> download(
            @PathVariable UUID archiveId,
            @PathVariable String kind) {
        if (!kind.equalsIgnoreCase("pdf") && !kind.equalsIgnoreCase("snapshot")) {
            return ResponseEntity.badRequest().build();
        }
        ArchiveDocumentService documentService = archiveDocumentServiceProvider.getIfAvailable();
        if (documentService == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archival storage is not configured");
        }
        ArchiveDownload file = documentService.download(archiveId, kind);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(file.contentType()))
                .header("Content-Disposition", "attachment; filename=\"" + file.fileName() + "\"")
                .body(new ByteArrayResource(file.content()));
    }

    private ArchiveRequestService requireArchiveService() {
        ArchiveRequestService service = archiveRequestServiceProvider.getIfAvailable();
        if (service == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Archival storage is not configured");
        }
        return service;
    }
}
