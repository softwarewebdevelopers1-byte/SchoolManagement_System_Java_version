package com.example.school.system.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.controller.admin.DTO.ApproveSchoolDto;
import com.example.school.system.controller.admin.service.SchoolAcceptance;
import com.example.school.system.controller.admin.service.Teachers;
import com.example.school.system.services.admin.GetAllSchools;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/complex")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SchoolsController {
    private final GetAllSchools schools;
    private final Teachers teachers;
    private final SchoolAcceptance schoolAcceptance;

    @GetMapping("/get/all/schools")
    public ResponseEntity<?> getAllSchools() {
        var res = schools.getAllSchools();
        return ResponseEntity.status(200).body(SchoolApiResponse.success(res, "Schools loaded"));
    }

    @GetMapping("/get/all/teachers")
    public ResponseEntity<?> getAllTeachers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var res = teachers.getTeachers(page, size);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(res, "teachers loaded"));
    }

    @GetMapping("/get/all/students")
    public ResponseEntity<?> getAllStudents(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.status(200).body(null);
    }

    @GetMapping("/get/schools/pending/approval")
    public ResponseEntity<?> getPendingSchools() {
        var schools = schoolAcceptance.pendingApprovalSchools();
        return ResponseEntity.status(200).body(schools);
    }

    @PostMapping("/approve/school")
    public ResponseEntity<?> approveSchool(@Valid @RequestBody ApproveSchoolDto approval) {
        var res = schoolAcceptance.acceptSchool(approval.schoolId(), approval.schoolName(), approval.schoolStatus());
        return ResponseEntity.status(0).body(res);
    }
}
