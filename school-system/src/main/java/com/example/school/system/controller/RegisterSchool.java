package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.error.SchoolExistsExceptionHandler;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.services.CreateSchoolService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class RegisterSchool {
    private final SchoolRepository schoolRepository;
    private final CreateSchoolService schoolService;

    public RegisterSchool(SchoolRepository schoolRepository, CreateSchoolService schoolService) {
        this.schoolRepository = schoolRepository;
        this.schoolService = schoolService;
    }

    @PostMapping("/api/create-school")
    public CreateSchoolDTO createSchool(@Valid @RequestBody CreateSchoolDTO schoolDto) {
        if (schoolRepository.existsBySchoolName(schoolDto.schoolName()))
            throw new SchoolExistsExceptionHandler("school with that name already exists");
        schoolService.registerSchool(schoolDto);
        return schoolDto;
    }

}
