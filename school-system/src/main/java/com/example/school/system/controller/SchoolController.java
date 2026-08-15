package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateSchoolDTO;
import com.example.school.system.DTO.GetSchoolDTO;
import com.example.school.system.DTO.OtpValidationDTO;
import com.example.school.system.DTO.UpdateSchoolDTO;
import com.example.school.system.DTO.UpdateTermAndExam;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SchoolService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;
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
import org.springframework.web.bind.annotation.RequestParam;

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
    @PatchMapping("/update/school")
    public ResponseEntity<?> updateSchool(@RequestHeader("Authorization") String authHeader,
            @RequestBody UpdateSchoolDTO schoolData) {

        var updateSchoolRes = schoolService.UpdateExistingSchool(schoolData, authHeader);
        return ResponseEntity.status(200).body(updateSchoolRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/school")
    public ResponseEntity<?> deleteSchool(@RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody OtpValidationDTO otpValidationDTO) {
        SchoolApiResponse<?> deleteSchoolResponse = schoolService.deleteSchool(otpValidationDTO, authHeader);
        return ResponseEntity.status(204).body(deleteSchoolResponse);
    }

    @GetMapping("/get/school/for/user")
    public ResponseEntity<?> getSchool(@RequestParam(required = false) String schoolCode,
            @RequestBody(required = false) GetSchoolDTO getSchoolDTO) {
        String code = schoolCode != null ? schoolCode : getSchoolDTO != null ? getSchoolDTO.schoolCode() : null;
        SchoolApiResponse<?> getSchoolResponse = schoolService.getSchool(code);
        return ResponseEntity.status(200).body(getSchoolResponse);
    }

    @PutMapping("/update/term/exam")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> termExamUpdate(@Valid @RequestBody UpdateTermAndExam updateTermAndExam) {
        return schoolService.bulkUpdateTerm(updateTermAndExam);
    }

    @GetMapping("/get/term/exam/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','HEADTEACHER','DEPUTYTEACHER','SUBJECTTEACHER','STUDENT')")
    public ResponseEntity<?> getTermYearAndExamType(@PathVariable UUID id) {
        var res = schoolService.getTermYearAndExamType(id);
        return ResponseEntity.status(200).body(res);
    }

    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> schoolSettings(@RequestParam UUID schoolId) {
        var res = schoolService.schoolSettings(schoolId);
        return ResponseEntity.status(200).body(res);
    }
}
