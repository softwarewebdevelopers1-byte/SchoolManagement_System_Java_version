package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.DTOResponse.TeacherEditDTO;
import com.example.school.system.services.TeachersService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class TeachersController {
    private final TeachersService teachersService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/teachers")
    public SchoolApiResponse<?> getTeachers(@PathVariable UUID id) {
        var teachers = teachersService.getTeachers(id);
        return SchoolApiResponse.success(teachers, "User updated");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/update")
    public SchoolApiResponse<?> updateTeacherDetails(@PathVariable UUID id,
            @RequestBody TeacherEditDTO teacherEditDTO) {
        teachersService.EditTeacher(teacherEditDTO, id);
        return SchoolApiResponse.success("User updated");
    }
}
