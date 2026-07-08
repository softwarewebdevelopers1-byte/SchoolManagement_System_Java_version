package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.services.SchoolService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class SchoolController {
    private final SchoolRepository schoolRepository;
    private final SchoolService schoolService;

    public SchoolController(SchoolRepository schoolRepository, SchoolService schoolService) {
        this.schoolRepository = schoolRepository;
        this.schoolService = schoolService;
    }

    @PostMapping("/api/create-school")
    public SchoolApiResponse<?> createSchool(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateSchoolDTO schoolDto) {
        schoolService.validateSchoolToken(authHeader);
        if (schoolRepository.existsBySchoolName(schoolDto.schoolName()))
            throw new SchoolResourceExistsExceptionHandler("school with that name already exists");
        schoolService.registerSchool(schoolDto);
        return SchoolApiResponse.success("School registered successfully");
    }

    @PutMapping("/api/update/school/{id}")
    public SchoolApiResponse<?> updateSchool(@PathVariable String id, @RequestHeader("Authorization") String token,
            @RequestBody CreateSchoolDTO schoolData) {
        Long schoolId = Long.parseLong(id);
        return schoolService.UpdateExistingSchool(schoolId, schoolData, token);
    }

    @DeleteMapping("/api/delete/school/{id}")
    public SchoolApiResponse<?> DeleteSchool(@PathVariable String id, @RequestHeader("Authorization") String token) {
        Long schoolId = Long.parseLong(id);
        return schoolService.DeleteSchool(schoolId, token);
    }
}