package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.TeacherAddProfile;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.DTOResponse.TeacherEditDTO;
import com.example.school.system.services.TeachersService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class TeachersController {
    private final TeachersService teachersService;

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','CLASSTEACHER','DEPUTYTEACHER','SUBJECTTEACHER')")
    @PostMapping("/teacher/add-profile")
    public ResponseEntity<?> addProfile(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody TeacherAddProfile teacherAddProfile) {
        SchoolApiResponse<?> addTeacherRes = teachersService.addProfile(teacherAddProfile);
        return ResponseEntity.status(201).body(addTeacherRes);

    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/teachers")
    public ResponseEntity<?> getTeachers(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id) {
        var teachers = teachersService.getTeachers(id, authHeader);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(teachers, "teachers loaded"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/update")
    public ResponseEntity<?> updateTeacherDetails(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody TeacherEditDTO teacherEditDTO) {
        teachersService.EditTeacher(teacherEditDTO, authHeader);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("User updated"));
    }
}
