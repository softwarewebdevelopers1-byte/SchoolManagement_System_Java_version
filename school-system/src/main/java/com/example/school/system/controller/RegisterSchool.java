package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.error.SchoolExistsExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class RegisterSchool {
    private final SchoolRepository schoolRepository;
    private final SchoolSettingsRepository schoolSettingsRepository;

    public RegisterSchool(SchoolRepository schoolRepository, SchoolSettingsRepository schoolSettingsRepository) {
        this.schoolRepository = schoolRepository;
        this.schoolSettingsRepository = schoolSettingsRepository;
    }

    @PostMapping("/api/create-school")
    public CreateSchoolDTO createSchool(@Valid @RequestBody CreateSchoolDTO schoolDto) {
        if (schoolRepository.existsBySchoolName(schoolDto.schoolName()))
            throw new SchoolExistsExceptionHandler("school with that name already exists");
        School school = toSchool(schoolDto);
        school = schoolRepository.save(school);

        SchoolSettings settings = new SchoolSettings();
        settings.setSchool(school);
        schoolSettingsRepository.save(settings);
        return schoolDto;
    }

    private School toSchool(CreateSchoolDTO dto) {
        School school = new School();
        school.setSchoolName(dto.schoolName());
        return school;
    }

}
