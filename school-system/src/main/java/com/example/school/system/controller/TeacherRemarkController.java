package com.example.school.system.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.TeacherRemarkDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.models.TeacherRemark;
import com.example.school.system.services.TeacherRemarkService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class TeacherRemarkController {
    private final TeacherRemarkService teacherRemarkService;

    @PreAuthorize("hasAnyRole('ADMIN','SUBJECTTEACHER')")
    @GetMapping("/teacher-remarks")
    public ResponseEntity<?> getTeacherRemarks(
            @RequestParam UUID schoolId,
            @RequestParam UUID subjectId,
            @RequestParam UUID teacherId) {
        List<TeacherRemark> remarks = teacherRemarkService.getRemarks(schoolId, subjectId, teacherId);
        return ResponseEntity.ok(SchoolApiResponse.success(remarks, "remarks loaded"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','SUBJECTTEACHER')")
    @PutMapping("/teacher-remarks")
    public ResponseEntity<?> upsertTeacherRemark(@Valid @RequestBody TeacherRemarkDTO dto) {
        TeacherRemark saved = teacherRemarkService.upsertRemark(dto);
        return ResponseEntity.ok(SchoolApiResponse.success(
                Map.of("id", saved.getId(), "gradeBand", saved.getGradeBand()),
                "remark saved"));
    }
}
