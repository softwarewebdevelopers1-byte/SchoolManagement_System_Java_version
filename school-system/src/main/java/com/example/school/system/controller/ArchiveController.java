package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.DashboardService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ArchiveController {
    private final DashboardService dashboardService;

    @GetMapping("/school/archives")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER')")
    public ResponseEntity<?> getArchives(
            @RequestParam(required = false) String classGrade,
            @RequestParam(required = false) String classStream,
            @RequestParam(required = false) String studentId) {
        return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "archives loaded"));
    }
}
