package com.example.school.system.controller.admin.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.DTOResponse.SchoolDtoRes;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.types.SchoolStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SchoolAcceptance {
    private final SchoolRepository schoolRepository;

    @Transactional
    public SchoolApiResponse<?> acceptSchool(UUID schoolId, String schoolName, SchoolStatus schoolStatus) {
        School schoolFound = schoolRepository
                .findByIdAndSchoolNameAndStatus(schoolId, schoolName, SchoolStatus.PENDING_APPROVAL)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        schoolFound.setStatus(schoolStatus);
        return SchoolApiResponse.success("school approved");
    }

    public SchoolApiResponse<?> pendingApprovalSchools() {
        List<SchoolDtoRes> schools = schoolRepository.findAllByStatus(SchoolStatus.PENDING_APPROVAL).stream()
                .map(s -> {
                    return SchoolDtoRes.builder().schoolId(s.getId()).schoolCode(s.getSchoolCode())
                            .schoolName(s.getSchoolName()).build();
                }).toList();
        return SchoolApiResponse.success(schools, "schools loaded");
    }
}
