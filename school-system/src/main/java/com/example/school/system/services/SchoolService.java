package com.example.school.system.services;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;

@Service
public class SchoolService {
    private final SchoolSettingsRepository schoolSettingsRepository;
    private final SchoolRepository schoolRepository;

    public SchoolService(SchoolSettingsRepository schoolSettingsRepository, SchoolRepository schoolRepository) {
        this.schoolSettingsRepository = schoolSettingsRepository;
        this.schoolRepository = schoolRepository;

    }

    public void registerSchool(CreateSchoolDTO schoolDto) {
        School school = toSchool(schoolDto);
        school = schoolRepository.save(school);

        SchoolSettings settings = new SchoolSettings();
        settings.setSchool(school);
        schoolSettingsRepository.save(settings);
    }

    private School toSchool(CreateSchoolDTO dto) {
        School school = new School();
        school.setSchoolName(dto.schoolName());
        return school;
    }
}
