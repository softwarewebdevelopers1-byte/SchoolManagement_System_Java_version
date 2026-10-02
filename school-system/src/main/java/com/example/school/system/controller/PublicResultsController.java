package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.ResultAccessRequest;
import com.example.school.system.DTO.ResultPublicationRequest;
import com.example.school.system.DTO.ResultPublicationStatusResponse;
import com.example.school.system.services.ResultAccessService;
import com.example.school.system.types.ExamType;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PublicResultsController {
    private final ResultAccessService resultAccessService;

    @GetMapping("/api/public/results/{token}")
    public ResponseEntity<?> getResults(@PathVariable String token) {
        return ResponseEntity.ok(resultAccessService.getPublishedResults(token));
    }

    @PostMapping("/api/results/access")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createAccess(@Valid @RequestBody ResultAccessRequest request) {
        return ResponseEntity.status(201).body(resultAccessService.createAccess(request));
    }

    @PostMapping("/api/results/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> publishResults(@Valid @RequestBody ResultPublicationRequest request) {
        return ResponseEntity.ok(resultAccessService.publishResults(request));
    }

    @GetMapping("/api/admin/results-publication-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResultPublicationStatusResponse> getPublicationStatus() {
        return ResponseEntity.ok(resultAccessService.getPublicationStatus());
    }

    @DeleteMapping("/api/results/access/{accessId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> revokeAccess(@PathVariable UUID accessId) {
        resultAccessService.revokeAccess(accessId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/admin/results-links")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listResultLinks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        return ResponseEntity.ok(resultAccessService.listLinks(page, size, search, status, sort, direction));
    }

    @GetMapping("/api/admin/results-links/{accessId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getResultLink(@PathVariable UUID accessId) {
        return ResponseEntity.ok(resultAccessService.getLink(accessId));
    }

    @PostMapping("/api/admin/results-links/{accessId}/renew")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> renewResultLink(@PathVariable UUID accessId) {
        return ResponseEntity.ok(resultAccessService.renewLink(accessId));
    }

    @PostMapping("/api/admin/results-links/{accessId}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resendResultNotification(@PathVariable UUID accessId) {
        resultAccessService.resendResultNotification(accessId);
        return ResponseEntity.accepted().body(
                com.example.school.system.DTO.DTOResponse.SchoolApiResponse.success(
                        "results notification queued for resend"));
    }
}
