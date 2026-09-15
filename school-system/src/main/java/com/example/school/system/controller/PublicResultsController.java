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
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.ResultAccessRequest;
import com.example.school.system.DTO.ResultPublicationRequest;
import com.example.school.system.services.ResultAccessService;

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

    @DeleteMapping("/api/results/access/{accessId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> revokeAccess(@PathVariable UUID accessId) {
        resultAccessService.revokeAccess(accessId);
        return ResponseEntity.noContent().build();
    }
}
