package com.example.school.system.services;

import java.nio.ByteBuffer;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.attendanceInsights.AttendanceDailyDTO;
import com.example.school.system.DTO.attendanceInsights.AttendanceMonthlySummaryDTO;
import com.example.school.system.DTO.attendanceInsights.AttendanceTermlySummaryDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.projection.AttendanceMonthlyProjection;
import com.example.school.system.projection.AttendanceTermlyProjection;
import com.example.school.system.repository.AttendanceRecordRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.SchoolClassRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminAttendanceInsightsService {
    private final AuthenticatedUserService authenticatedUserService;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSheetRepository attendanceSheetRepository;
    private final SchoolClassRepository schoolClassRepository;

    private UUID currentSchoolId() {
        var currentUser = authenticatedUserService.currentUser();
        UUID schoolId = currentUser.user().getSchoolId();
        if (schoolId == null) {
            throw new SchoolResourceNotFoundExceptionHandler("Authenticated user is not assigned to a school");
        }
        return schoolId;
    }

    private static UUID bytesToUuid(byte[] bytes) {
        if (bytes == null || bytes.length < 16) {
            return null;
        }
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        return new UUID(bb.getLong(), bb.getLong());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDailyDTO> getDailyAttendance(UUID classId, LocalDate date) {
        SchoolClass schoolClass = schoolClassRepository.findByClassId(classId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getSchool().getId().equals(currentSchoolId())) {
            throw new SchoolResourceNotFoundExceptionHandler("class not found in current school");
        }

        AttendanceSheet sheet = attendanceSheetRepository
                .findBySchoolClassClassIdAndDate(classId, date)
                .orElse(null);
        if (sheet == null || sheet.getAttendanceRecords() == null) {
            return List.of();
        }

        return sheet.getAttendanceRecords().stream().map(r -> {
            StudentProfile student = r.getStudent();
            return new AttendanceDailyDTO(
                    student.getId(),
                    student.getStudentFullName(),
                    student.getStudentAdm(),
                    r.getStatus() != null ? r.getStatus().name() : null,
                    r.getDate()
            );
        }).toList();
    }

    @Transactional(readOnly = true)

    public Page<AttendanceMonthlySummaryDTO> getMonthlyAttendance(UUID classId, LocalDate startDate, LocalDate endDate, int page, int size) {
        SchoolClass schoolClass = schoolClassRepository.findByClassId(classId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getSchool().getId().equals(currentSchoolId())) {
            throw new SchoolResourceNotFoundExceptionHandler("class not found in current school");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<AttendanceMonthlyProjection> result = attendanceRecordRepository.findMonthlyAttendanceByClass(classId, startDate, endDate, pageable);
        return result.map(p -> new AttendanceMonthlySummaryDTO(
                bytesToUuid(p.getStudentId()),
                p.getStudentName(),
                p.getAdmissionNo(),
                p.getTotalDays(),
                p.getPresentDays(),
                p.getAbsentDays(),
                p.getAttendancePercentage()
        ));
    }

    @Transactional(readOnly = true)

    public Page<AttendanceTermlySummaryDTO> getTermlyAttendance(UUID classId, LocalDate startDate, LocalDate endDate, int page, int size) {
        SchoolClass schoolClass = schoolClassRepository.findByClassId(classId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getSchool().getId().equals(currentSchoolId())) {
            throw new SchoolResourceNotFoundExceptionHandler("class not found in current school");
        }

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<AttendanceTermlyProjection> result = attendanceRecordRepository.findTermlyAttendanceByClass(classId, startDate, endDate, pageable);
        return result.map(p -> new AttendanceTermlySummaryDTO(
                bytesToUuid(p.getStudentId()),
                p.getStudentName(),
                p.getAdmissionNo(),
                p.getTotalSessions(),
                p.getPresentSessions(),
                p.getAttendancePercentage()
        ));
    }
}
