package com.example.school.system.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.GetStudentsOfSpecificClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.services.SchoolClassService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GetStudentsController {
    private final SchoolClassService schoolClassService;

    @GetMapping("/get/students")
    public List<?> GetStudentsOfSpecificClass(
            @Valid @RequestBody GetStudentsOfSpecificClass getStudentsOfSpecificClass,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name,asc") String sort) {
        return schoolClassService.getStudentByClass(getStudentsOfSpecificClass, page, size);
    }
}
