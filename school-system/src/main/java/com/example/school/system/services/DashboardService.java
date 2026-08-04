package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.DTOResponse.DashboardSummary;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.repository.TimetableRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final AuthenticatedUserService authenticatedUserService;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectRepository subjectRepository;
    private final AttendanceSheetRepository attendanceSheetRepository;
    private final TimetableRepository timetableRepository;

    public DashboardSummary summary() {
        Users user = userRepository.findById(authenticatedUserService.currentUserId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("Authenticated user was not found"));
        if (user.getSchool() == null) {
            throw new SchoolResourceNotFoundExceptionHandler("Authenticated user is not assigned to a school");
        }

        UUID schoolId = user.getSchool().getId();
        List<String> roles = user.getRoles().stream().map(Enum::name).sorted().toList();
        return new DashboardSummary(
                roles,
                userRepository.findUsersBySchoolIdWithRole(schoolId, UserRoles.STUDENT,
                        org.springframework.data.domain.Pageable.unpaged()).getTotalElements(),
                userRepository.findUsersBySchoolWithoutRole(schoolId, UserRoles.STUDENT).size(),
                schoolClassRepository.findBySchoolId(schoolId).size(),
                subjectRepository.findAllBySchoolId(schoolId).size(),
                attendanceSheetRepository.findAll().stream()
                        .filter(sheet -> sheet.getDate().equals(LocalDate.now()))
                        .filter(sheet -> sheet.getSchoolClass().getSchool().getId().equals(schoolId))
                        .count(),
                !timetableRepository.findAllBySchoolIdOrderByGeneratedAtDesc(schoolId).isEmpty(),
                LocalDate.now());
    }
}
