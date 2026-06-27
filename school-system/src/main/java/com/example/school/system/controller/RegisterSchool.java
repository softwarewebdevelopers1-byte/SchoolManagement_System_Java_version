package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.error.SchoolExistsExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.repository.SchoolRepository;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class RegisterSchool {
    SchoolRepository schoolRepository;

    public RegisterSchool(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @PostMapping("/api/create-school")
    public CreateSchoolDTO createSchool(@Valid @RequestBody CreateSchoolDTO schoolDto) {
        if (schoolRepository.existsBySchoolName(schoolDto.schoolName()))
            throw new SchoolExistsExceptionHandler("school with that name already exists");
        schoolRepository.save(toSchool(schoolDto));
        return schoolDto;
    }

    private School toSchool(CreateSchoolDTO dto) {
        School school = new School();
        school.setSchoolName(dto.schoolName());
        return school;
    }

}
