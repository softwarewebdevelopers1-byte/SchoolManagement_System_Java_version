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

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/schools")
public class SchoolController {

    private final SchoolService schoolService;

    @PostMapping("/create-school")
    public ResponseEntity<?> createSchool(
            @Valid @RequestBody CreateSchoolDTO schoolDto) {
        SchoolApiResponse<?> schoolCreationRes = schoolService.registerSchool(schoolDto);
        return ResponseEntity.status(201).body(schoolCreationRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/update/school/{id}")
    public ResponseEntity<?> updateSchool(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id,
            @RequestBody UpdateSchoolDTO schoolData) {

        var updateSchoolRes = schoolService.UpdateExistingSchool(id, schoolData, authHeader);
        return ResponseEntity.status(200).body(updateSchoolRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/school/{id}")
    public ResponseEntity<?> deleteSchool(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id,
            @Valid @RequestBody OtpValidationDTO otpValidationDTO) {
        SchoolApiResponse<?> deleteSchoolResponse = schoolService.deleteSchool(id, otpValidationDTO, authHeader);
        return ResponseEntity.status(204).body(deleteSchoolResponse);
    }

    @GetMapping("/get/school/for/user")
    public ResponseEntity<?> getSchool(@RequestBody GetSchoolDTO getSchoolDTO) {
        SchoolApiResponse<?> getSchoolResponse = schoolService.getSchool(getSchoolDTO.schoolCode());
        return ResponseEntity.status(200).body(getSchoolResponse);
    }
}
