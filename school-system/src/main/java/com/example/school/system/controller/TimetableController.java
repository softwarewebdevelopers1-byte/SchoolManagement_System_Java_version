package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.timetable.SchoolTimetableSettingsRequest;
import com.example.school.system.DTO.timetable.SubjectRequirementRequest;
import com.example.school.system.DTO.timetable.TimetableGenerateRequest;
import com.example.school.system.services.timetable.TimetableGenerationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("api/timetables")
public class TimetableController {
    private final TimetableGenerationService timetableGenerationService;

    @GetMapping("/my")
    public ResponseEntity<?> getMyTimetable(
            @RequestParam(defaultValue = "teacher") String view,
            @RequestHeader("Authorization") String authHeader) {
        var response = timetableGenerationService.getTeacherTimetable(authHeader, view);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "timetable loaded"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTimetable(@PathVariable UUID id) {
        timetableGenerationService.deleteTimetableEntry(id);
        return ResponseEntity.ok(SchoolApiResponse.success("timetable deleted"));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> configureSettings(@Valid @RequestBody SchoolTimetableSettingsRequest request) {
        timetableGenerationService.configureSettings(request);
        return ResponseEntity.ok(SchoolApiResponse.success("timetable settings saved"));
    }

    @PutMapping("/requirements")
    public ResponseEntity<?> upsertRequirement(@Valid @RequestBody SubjectRequirementRequest request) {
        timetableGenerationService.upsertSubjectRequirement(request);
        return ResponseEntity.ok(SchoolApiResponse.success("subject requirement saved"));
    }

    @PostMapping("/generate")
    public ResponseEntity<?> generate(@Valid @RequestBody TimetableGenerateRequest request) {
        var response = timetableGenerationService.generate(request.schoolId(), Boolean.TRUE.equals(request.replaceExisting()));
        return ResponseEntity.status(201).body(SchoolApiResponse.success(response, "timetable generated"));
    }

    @PostMapping("/preview/{schoolId}")
    public ResponseEntity<?> preview(@PathVariable UUID schoolId) {
        var response = timetableGenerationService.preview(schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "timetable preview generated"));
    }

    @PostMapping("/regenerate")
    public ResponseEntity<?> regenerate(@Valid @RequestBody TimetableGenerateRequest request) {
        var response = timetableGenerationService.generate(request.schoolId(), true);
        return ResponseEntity.status(201).body(SchoolApiResponse.success(response, "timetable regenerated"));
    }

    @GetMapping("/validate/{schoolId}")
    public ResponseEntity<?> validate(@PathVariable UUID schoolId) {
        var response = timetableGenerationService.validateActiveTimetable(schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "timetable validated"));
    }

    @GetMapping("/{schoolId}")
    public ResponseEntity<?> getTimetable(@PathVariable UUID schoolId) {
        var response = timetableGenerationService.getActiveTimetable(schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "timetable loaded"));
    }

    @DeleteMapping("/{schoolId}")
    public ResponseEntity<?> deleteTermTimetable(@PathVariable UUID schoolId) {
        timetableGenerationService.deleteTermTimetable(schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success("timetable deleted"));
    }

    @GetMapping("/history/{schoolId}")
    public ResponseEntity<?> generationHistory(@PathVariable UUID schoolId) {
        var response = timetableGenerationService.history(schoolId);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "generation history loaded"));
    }

    @GetMapping("/conflicts/{generationHistoryId}")
    public ResponseEntity<?> conflictReport(@PathVariable UUID generationHistoryId) {
        var response = timetableGenerationService.conflictReport(generationHistoryId);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "conflict report loaded"));
    }

    @GetMapping("/school/timetables/my")
    public ResponseEntity<?> getMyTimetable(@RequestParam(required = false) String view) {
        var response = timetableGenerationService.getActiveTimetable(null);
        return ResponseEntity.ok(SchoolApiResponse.success(response, "my timetable loaded"));
    }

    @DeleteMapping("/school/timetables/{id}")
    public ResponseEntity<?> deleteTimetableById(@PathVariable UUID id) {
        timetableGenerationService.deleteTermTimetable(id);
        return ResponseEntity.ok(SchoolApiResponse.success("timetable deleted"));
    }
}
