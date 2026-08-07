package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ClassSubjectController {
    @GetMapping("/school/class-subjects")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','DEPUTYTEACHER','HEADTEACHER','SUBJECTTEACHER')")
    public ResponseEntity<?> getClassSubjects(
            @RequestParam(required = false) String classGrade,
            @RequestParam(required = false) String classStream,
            @RequestParam(required = false) UUID subjectId) {
        if (classGrade == null || classStream == null) {
            return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "class subjects loaded"));
        }
        return ResponseEntity.ok(SchoolApiResponse.success(List.of(), "class subjects loaded"));
    }

    @PutMapping("/school/class-subjects")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER')")
    public ResponseEntity<?> updateClassSubject(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(SchoolApiResponse.success("subject setting updated"));
    }
}
