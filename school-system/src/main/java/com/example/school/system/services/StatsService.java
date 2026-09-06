package com.example.school.system.services;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.stats.AttendanceTrendDTO;
import com.example.school.system.DTO.stats.ClassAnalyticsDTO;
import com.example.school.system.DTO.stats.SchoolOverviewStatsDTO;
import com.example.school.system.DTO.stats.StreamPerformanceDTO;
import com.example.school.system.DTO.stats.SubjectCoverageDTO;
import com.example.school.system.DTO.stats.SubjectPerformanceDTO;
import com.example.school.system.DTO.stats.TeacherSummaryStatsDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.projection.SubjectAnalyticsProjection;
import com.example.school.system.projection.SubjectGradeDistributionProjection;
import com.example.school.system.projection.StreamPerformanceProjection;
import com.example.school.system.projection.TeacherStatusCountProjection;
import com.example.school.system.projection.SubjectCoverageProjection;
import com.example.school.system.projection.AttendanceTrendProjection;
import com.example.school.system.repository.AttendanceRecordRepository;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.ExamType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final AuthenticatedUserService authenticatedUserService;
    private final UserRepository userRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final MarksRepo marksRepo;
    private final SchoolSettingsRepository schoolSettingsRepository;

    private UUID currentSchoolId() {
        var currentUser = authenticatedUserService.currentUser();
        UUID schoolId = currentUser.user().getSchoolId();
        if (schoolId == null) {
            throw new SchoolResourceNotFoundExceptionHandler("Authenticated user is not assigned to a school");
        }
        return schoolId;
    }

    @Transactional(readOnly = true)
    public SchoolOverviewStatsDTO getSchoolOverview() {
        UUID schoolId = currentSchoolId();
        long studentCount = userRepository.countBySchoolIdAndRolesContaining(schoolId, com.example.school.system.types.UserRoles.STUDENT);
        long staffCount = userRepository.countBySchoolIdAndRolesNotContaining(schoolId, com.example.school.system.types.UserRoles.STUDENT);
        long classCount = schoolClassRepository.countBySchoolId(schoolId);

        SchoolSettings settings = schoolSettingsRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        Double avgAttendanceRate = attendanceRecordRepository.findAverageAttendanceRateBySchool(schoolId, startDate, endDate);
        if (avgAttendanceRate == null) avgAttendanceRate = 0.0;

        List<StreamPerformanceProjection> streamProjections = schoolClassRepository.findStreamPerformanceBySchool(
                schoolId, settings.getAcademicYear(), settings.getCurrentSchoolTerm(),
                settings.getExamSettings() != null ? settings.getExamSettings().getExamType().name() : null);

        List<StreamPerformanceDTO> streamPerformance = streamProjections.stream()
                .map(p -> new StreamPerformanceDTO(
                        p.getStream(),
                        p.getAvgMarks() != null ? p.getAvgMarks() : 0.0,
                        0.0,
                        p.getStudentCount() != null ? p.getStudentCount() : 0))
                .collect(Collectors.toList());

        List<SubjectAnalyticsProjection> subjectProjections = marksRepo.findSubjectPerformanceBySchool(
                schoolId, settings.getAcademicYear(), settings.getCurrentSchoolTerm(),
                settings.getExamSettings() != null ? settings.getExamSettings().getExamType().name() : null);

        List<SubjectPerformanceDTO> subjectPerformance = subjectProjections.stream()
                .map(p -> new SubjectPerformanceDTO(
                        p.getSubjectId(),
                        p.getSubjectName(),
                        p.getAvgPercentage() != null ? p.getAvgPercentage() : 0.0,
                        p.getAvgPoints() != null ? p.getAvgPoints() : 0.0,
                        Map.of()))
                .collect(Collectors.toList());

        return new SchoolOverviewStatsDTO(
                studentCount,
                staffCount,
                classCount,
                avgAttendanceRate,
                streamPerformance,
                subjectPerformance);
    }

    @Transactional(readOnly = true)
    public List<AttendanceTrendDTO> getAttendanceTrend(UUID classId, LocalDate startDate, LocalDate endDate) {
        SchoolClass schoolClass = schoolClassRepository.findByClassId(classId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getSchool().getId().equals(currentSchoolId())) {
            throw new SchoolResourceNotFoundExceptionHandler("class not found in current school");
        }

        return attendanceRecordRepository.findAttendanceTrendByClass(classId, startDate, endDate).stream()
                .map(p -> new AttendanceTrendDTO(
                        p.getDate(),
                        p.getPresent(),
                        p.getAbsent(),
                        p.getRate()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClassAnalyticsDTO> getClassAnalytics(UUID classId, Integer term, String academicYear, ExamType examType) {
        SchoolClass schoolClass = schoolClassRepository.findByClassId(classId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        if (!schoolClass.getSchool().getId().equals(currentSchoolId())) {
            throw new SchoolResourceNotFoundExceptionHandler("class not found in current school");
        }

        List<SubjectAnalyticsProjection> analytics = marksRepo.findSubjectAnalyticsByClass(
                classId, academicYear, term, examType.name());
        List<SubjectGradeDistributionProjection> distributions = marksRepo.findSubjectGradeDistributionByClass(
                classId, academicYear, term, examType.name());

        Map<UUID, Map<String, Long>> distributionBySubject = distributions.stream()
                .collect(Collectors.groupingBy(
                        SubjectGradeDistributionProjection::getSubjectId,
                        Collectors.groupingBy(
                                SubjectGradeDistributionProjection::getGrade,
                                Collectors.summingLong(SubjectGradeDistributionProjection::getCount))));

        return analytics.stream()
                .map(p -> {
                    Map<String, Long> gradeDist = distributionBySubject.getOrDefault(p.getSubjectId(), Map.of());
                    return new ClassAnalyticsDTO(
                            p.getSubjectId(),
                            p.getSubjectName(),
                            p.getAvgPercentage() != null ? p.getAvgPercentage() : 0.0,
                            p.getAvgPoints() != null ? p.getAvgPoints() : 0.0,
                            p.getStudentCount() != null ? p.getStudentCount() : 0,
                            gradeDist);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TeacherSummaryStatsDTO getTeacherSummary() {
        UUID schoolId = currentSchoolId();

        long total = userRepository.countBySchoolIdAndRolesNotContaining(schoolId, com.example.school.system.types.UserRoles.STUDENT);
        long active = 0;
        long onLeave = 0;
        long suspended = 0;

        List<TeacherStatusCountProjection> statusCounts = userRepository.countTeachersByStatus(schoolId);
        for (TeacherStatusCountProjection projection : statusCounts) {
            long count = projection.getCount();
            if (projection.getStatus() == com.example.school.system.types.AccountStatus.ACTIVE) {
                active = count;
            } else if (projection.getStatus() == com.example.school.system.types.AccountStatus.INACTIVE) {
                onLeave = count;
            } else if (projection.getStatus() == com.example.school.system.types.AccountStatus.SUSPENDED) {
                suspended = count;
            }
        }

        List<SubjectCoverageProjection> coverage = userRepository.findSubjectCoverageBySchool(schoolId);
        List<SubjectCoverageDTO> subjectCoverage = coverage.stream()
                .map(p -> new SubjectCoverageDTO(p.getSubjectName(), p.getTeacherCount()))
                .collect(Collectors.toList());

        return new TeacherSummaryStatsDTO(total, active, onLeave, suspended, subjectCoverage);
    }
}
