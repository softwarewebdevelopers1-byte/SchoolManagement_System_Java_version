package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/teachers")
    public SchoolApiResponse<?> getTeachers(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id) {
        var teachers = teachersService.getTeachers(id, authHeader);
        return SchoolApiResponse.success(teachers, "teachers loaded");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update/{id}")
    public SchoolApiResponse<?> updateTeacherDetails(@RequestHeader("Authorization") String authHeader,
            @PathVariable UUID id,
            @Valid @RequestBody TeacherEditDTO teacherEditDTO) {
        teachersService.EditTeacher(teacherEditDTO, id, authHeader);
        return SchoolApiResponse.success("User updated");
    }
}
