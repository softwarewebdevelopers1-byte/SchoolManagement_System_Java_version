package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.DTO.OtpValidationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.OtpService;
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

    private final SchoolService schoolService;

    public SchoolController(SchoolService schoolService, OtpService otpService) {

        this.schoolService = schoolService;
    }

    @PostMapping("/api/create-school")
    public SchoolApiResponse<?> createSchool(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody CreateSchoolDTO schoolDto) {
        return schoolService.registerSchool(schoolDto, authHeader);
    }

    @PutMapping("/api/update/school/{id}")
    public SchoolApiResponse<?> updateSchool(@PathVariable String id, @RequestHeader("Authorization") String token,
            @RequestBody CreateSchoolDTO schoolData) {
        Long schoolId = Long.parseLong(id);
        return schoolService.UpdateExistingSchool(schoolId, schoolData, token);
    }

    @DeleteMapping("/api/delete/school/{id}")
    public SchoolApiResponse<?> deleteSchool(@PathVariable String id, @RequestHeader("Authorization") String token,
            @Valid @RequestBody OtpValidationDTO otpValidationDTO) {
        Long schoolId = Long.parseLong(id);
        return schoolService.deleteSchool(schoolId, token, otpValidationDTO);
    }
}
