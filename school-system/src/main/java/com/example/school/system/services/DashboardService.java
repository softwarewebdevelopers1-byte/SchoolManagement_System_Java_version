package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.DTOResponse.DashboardSummary;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
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

    @Transactional(readOnly = true)
    public DashboardSummary summary() {
        var currentUser = authenticatedUserService.currentUser();
        UUID schoolId = currentUser.user().getSchoolId();
        if (schoolId == null) {
            throw new SchoolResourceNotFoundExceptionHandler("Authenticated user is not assigned to a school");
        }

        List<String> roles = currentUser.permissions();
        long studentCount = userRepository.countBySchoolIdAndRolesContaining(schoolId, UserRoles.STUDENT);
        long teacherCount = userRepository.countBySchoolIdAndRolesNotContaining(schoolId, UserRoles.STUDENT);
        long classCount = schoolClassRepository.countBySchoolId(schoolId);
        long subjectCount = subjectRepository.countBySchoolId(schoolId);
        long attendanceSheetsToday = attendanceSheetRepository.countBySchoolClassSchoolIdAndDate(schoolId, LocalDate.now());
        boolean hasActiveTimetable = timetableRepository.existsBySchoolId(schoolId);
        return new DashboardSummary(
                roles,
                studentCount,
                teacherCount,
                classCount,
                subjectCount,
                attendanceSheetsToday,
                hasActiveTimetable,
                LocalDate.now());
    }
}
