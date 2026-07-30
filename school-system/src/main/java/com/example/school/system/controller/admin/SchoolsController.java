package com.example.school.system.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.admin.GetAllSchools;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/complex")
@PreAuthorize("hasRole('SUPERADMIN')")
public class SchoolsController {
    private final GetAllSchools schools;

    @GetMapping("/get/all/schools")
    public ResponseEntity<?> getAllSchools() {
        var res = schools.getAllSchools();
        return ResponseEntity.status(200).body(SchoolApiResponse.success(res, "Schools loaded"));
    }

    @GetMapping("/get/all/teachers")
    public ResponseEntity<?> getAllTeachers() {
        return ResponseEntity.status(200).body(null);
    }

    @GetMapping("/get/all/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.status(200).body(null);
    }
}
