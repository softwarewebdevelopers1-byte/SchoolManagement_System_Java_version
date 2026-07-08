package com.example.school.system.services;

import org.springframework.stereotype.Service;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.security.jwt.JwtValidation;

@Service
public class SchoolService {
    private final SchoolSettingsRepository schoolSettingsRepository;
    private final SchoolRepository schoolRepository;
    private JwtValidation jwtValidation;

    public SchoolService(SchoolSettingsRepository schoolSettingsRepository, SchoolRepository schoolRepository,
            JwtValidation jwtValidation) {
        this.schoolSettingsRepository = schoolSettingsRepository;
        this.schoolRepository = schoolRepository;
        this.jwtValidation = jwtValidation;

    }

    public void registerSchool(CreateSchoolDTO schoolDto) {
        School school = toSchool(schoolDto);
        school = schoolRepository.save(school);

        SchoolSettings settings = new SchoolSettings();
        settings.setSchool(school);
        schoolSettingsRepository.save(settings);
    }

    public void validateSchoolToken(String token) {
        jwtValidation.validateTokenIssued(token);
    }

    private School toSchool(CreateSchoolDTO dto) {
        School school = new School();
        school.setSchoolName(dto.schoolName());
        return school;
    }

    public SchoolApiResponse<?> UpdateExistingSchool(Long id, CreateSchoolDTO schoolData, String token) {
        jwtValidation.validateTokenIssued(token);
        if (!schoolRepository.existsById(id)) {
            throw new SchoolResourceNotFoundExceptionHandler("School with that Id does not exist");
        }
        if (schoolRepository.existsBySchoolName(schoolData.schoolName())) {
            throw new SchoolResourceExistsExceptionHandler("School with that name already exists");
        }

        School schoolToUpdate = schoolRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school with that Id does not exists"));
        String previousSchoolName = schoolToUpdate.getSchoolName();
        schoolToUpdate.setSchoolName(schoolData.schoolName());
        schoolRepository.save(schoolToUpdate);

        return SchoolApiResponse
                .success("Changed from" + " " + previousSchoolName + " " + "to" + " "
                        + schoolData.schoolName());
    }

    public SchoolApiResponse<?> DeleteSchool(Long id, String token) {
        jwtValidation.validateTokenIssued(token);
        School schoolFound = schoolRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school with that id does not exist"));
        schoolRepository.delete(schoolFound);
        return SchoolApiResponse.success();
    }
}
