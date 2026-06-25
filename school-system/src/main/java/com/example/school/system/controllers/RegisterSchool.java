package com.example.school.system.controllers;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.RegisterSchoolDTO;
import com.example.school.system.error.NonExistingSchool;
import com.example.school.system.models.School;
import com.example.school.system.repository.SchoolRepository;

@RestController
public class RegisterSchool {
    private final SchoolRepository schoolRepository;

    public RegisterSchool(SchoolRepository schoolRepository) {
        this.schoolRepository = schoolRepository;
    }

    @PostMapping("/create-school")
    public School createSchool(@RequestBody RegisterSchoolDTO schoolDTO) {
        if (schoolRepository.existsBySchoolName(schoolDTO.schoolName())) {
            throw new NonExistingSchool("School with this name already exists");
        }
        return schoolRepository.save(toSchool(schoolDTO));
    }

    public School toSchool(RegisterSchoolDTO schoolDto) {
        var school = new School();
        school.setSchoolName(schoolDto.schoolName());
        return school;
    }
}
