package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.DTO.GetSchoolDTO;
import com.example.school.system.DTO.OtpValidationDTO;
import com.example.school.system.DTO.UpdateSchoolDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PutMapping;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/schools")
public class SchoolController {

    private final SchoolService schoolService;

    @PostMapping("/create-school")
    public SchoolApiResponse<?> createSchool(
            @Valid @RequestBody CreateSchoolDTO schoolDto) {
        return schoolService.registerSchool(schoolDto);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/school/{id}")
    public SchoolApiResponse<?> updateSchool(@RequestHeader("Authorization") String header, @PathVariable UUID id,
            @RequestBody UpdateSchoolDTO schoolData) {

        return schoolService.UpdateExistingSchool(id, schoolData, header);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/school/{id}")
    public SchoolApiResponse<?> deleteSchool(@RequestHeader("Authorization") String header, @PathVariable UUID id,
            @Valid @RequestBody OtpValidationDTO otpValidationDTO) {
        return schoolService.deleteSchool(id, otpValidationDTO, header);
    }

    @GetMapping("/get/school/for/user")
    public SchoolApiResponse<?> getSchool(@RequestBody GetSchoolDTO getSchoolDTO) {
        return schoolService.getSchool(getSchoolDTO.schoolCode());
    }
}
