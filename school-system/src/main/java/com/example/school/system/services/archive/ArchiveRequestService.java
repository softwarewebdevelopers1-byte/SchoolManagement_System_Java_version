package com.example.school.system.services.archive;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.archive.ArchiveRecordResponse;
import com.example.school.system.DTO.archive.AttendanceArchivePreview;
import com.example.school.system.DTO.archive.AttendanceArchiveRequest;
import com.example.school.system.DTO.archive.ResultArchiveRequest;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.StudentSubjectSelection;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.services.AuthenticatedUserService;
import com.example.school.system.types.ArchiveStatus;
import com.example.school.system.types.MarksSheetStatus;
import com.example.school.system.types.SubjectType;
import com.example.school.system.types.WholeAttendanceSheetStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = { "edunex.archive.enabled", "edunex.archive.r2.enabled" }, havingValue = "true")
public class ArchiveRequestService {
    private final AuthenticatedUserService authenticatedUserService;
    private final SchoolClassRepository schoolClassRepository;
    private final SubjectJointRepo subjectJointRepo;
    private final StudentRepository studentRepository;
    private final StudentSubjectSelectionRepo studentSubjectSelectionRepo;
    private final MarksSheetRepo marksSheetRepo;
    private final MarksRepo marksRepo;
    private final ClassTermResultsRepo classTermResultsRepo;
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceSheetRepository attendanceSheetRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;

    @Transactional
    public ArchiveRecordResponse requestResultArchive(ResultArchiveRequest request) {
        UUID schoolId = currentSchoolId();
        SchoolClass schoolClass = schoolClassRepository.findByClassIdAndSchoolIdForUpdate(request.classId(), schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));

        ResultArchive existing = resultArchiveRepository
                .findFirstBySchoolIdAndClassIdAndAcademicYearAndTermAndExamTypeOrderByVersionDesc(
                        schoolId, schoolClass.getClassId(), request.academicYear(), request.term(), request.examType())
                .orElse(null);
        if (existing != null && existing.getStatus() != ArchiveStatus.FAILED) {
            return toResponse(existing);
        }

        List<ClassTermResults> publishedResults =
                classTermResultsRepo.findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        request.classId(), request.academicYear(), request.term(), request.examType());
        if (publishedResults.isEmpty() || publishedResults.stream().anyMatch(result -> !result.isPublished())) {
            throw new SchoolResourceBadInputExceptionHandler(
                    "publish and review all class results before finalizing them");
        }

        List<SubjectJoint> offeredSubjects = subjectJointRepo.findAllBySchoolClassClassId(request.classId()).stream()
                .filter(joint -> joint.getSubjectType() != SubjectType.DROPPED)
                .toList();
        List<MarksSheet> sheets = new java.util.ArrayList<>();
        java.util.Set<UUID> expectedResultStudentIds = new java.util.HashSet<>();
        for (SubjectJoint joint : offeredSubjects) {
            List<StudentProfile> eligibleStudents = getEligibleStudents(joint, request.classId());
            expectedResultStudentIds.addAll(eligibleStudents.stream().map(StudentProfile::getId).toList());
            sheets.add(validateExpectedMarks(joint, request, eligibleStudents));
        }
        if (sheets.isEmpty()) {
            throw new SchoolResourceBadInputExceptionHandler("class has no active subject offerings to archive");
        }
        java.util.Set<UUID> publishedStudentIds = publishedResults.stream()
                .map(result -> result.getStudentProfile().getId())
                .collect(java.util.stream.Collectors.toSet());
        if (!publishedStudentIds.containsAll(expectedResultStudentIds)) {
            throw new SchoolResourceBadInputExceptionHandler(
                    "published results are incomplete for one or more eligible students");
        }
        for (MarksSheet sheet : sheets) {
            sheet.setStatus(MarksSheetStatus.LOCKED);
        }
        marksSheetRepo.saveAll(sheets);

        ResultArchive archive = existing == null ? new ResultArchive() : existing;
        archive.setSchoolId(schoolId);
        archive.setClassId(schoolClass.getClassId());
        archive.setClassName(schoolClass.getClassGrade() + " " + schoolClass.getClassStream());
        archive.setAcademicYear(request.academicYear());
        archive.setTerm(request.term());
        archive.setExamType(request.examType());
        archive.setVersion(archive.getVersion() == null ? 1 : archive.getVersion());
        archive.setStatus(ArchiveStatus.PENDING);
        archive.setCleanupEligible(false);
        archive.setRequestedBy(authenticatedUserService.currentUserId());
        archive.setLastError(null);
        return toResponse(resultArchiveRepository.save(archive));
    }

    @Transactional
    public ArchiveRecordResponse requestAttendanceArchive(AttendanceArchiveRequest request) {
        validateRange(request.startDate(), request.endDate());
        UUID schoolId = currentSchoolId();
        SchoolClass schoolClass = schoolClassRepository.findByClassIdAndSchoolIdForUpdate(request.classId(), schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));

        AttendanceArchive existing = attendanceArchiveRepository
                .findFirstBySchoolIdAndClassIdAndStartDateAndEndDateOrderByVersionDesc(
                        schoolId, request.classId(), request.startDate(), request.endDate())
                .orElse(null);
        if (existing != null && existing.getStatus() != ArchiveStatus.FAILED) {
            return toResponse(existing);
        }

        List<AttendanceSheet> sheets = attendanceSheetRepository
                .findAllBySchoolClassClassIdAndDateBetweenOrderByDate(
                        request.classId(), request.startDate(), request.endDate());
        if (sheets.isEmpty()) {
            throw new SchoolResourceBadInputExceptionHandler("no attendance sheets exist in the selected date range");
        }
        if (sheets.stream().map(AttendanceSheet::getDate).distinct().count() != sheets.size()) {
            throw new SchoolResourceBadInputExceptionHandler(
                    "duplicate attendance sheets exist for one or more dates in the selected range");
        }
        long draftCount = sheets.stream()
                .filter(sheet -> sheet.getStatus() == WholeAttendanceSheetStatus.DRAFT).count();
        long submittedCount = sheets.stream()
                .filter(sheet -> sheet.getStatus() == WholeAttendanceSheetStatus.SUBMITTED).count();
        if (draftCount > 0 || submittedCount > 0) {
            throw new SchoolResourceBadInputExceptionHandler(
                    "only fully locked attendance ranges can be archived; draft sheets: "
                            + draftCount + ", submitted sheets: " + submittedCount);
        }

        AttendanceArchive archive = existing == null ? new AttendanceArchive() : existing;
        archive.setSchoolId(schoolId);
        archive.setClassId(request.classId());
        archive.setClassName(schoolClass.getClassGrade() + " " + schoolClass.getClassStream());
        archive.setStartDate(request.startDate());
        archive.setEndDate(request.endDate());
        archive.setVersion(archive.getVersion() == null ? 1 : archive.getVersion());
        archive.setStatus(ArchiveStatus.PENDING);
        archive.setCleanupEligible(false);
        archive.setRequestedBy(authenticatedUserService.currentUserId());
        archive.setLastError(null);
        return toResponse(attendanceArchiveRepository.save(archive));
    }

    @Transactional(readOnly = true)
    public AttendanceArchivePreview previewAttendanceArchive(AttendanceArchiveRequest request) {
        validateRange(request.startDate(), request.endDate());
        UUID schoolId = currentSchoolId();
        schoolClassRepository.findByClassIdAndSchoolId(request.classId(), schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));

        java.util.Map<WholeAttendanceSheetStatus, Long> counts = new java.util.EnumMap<>(
                WholeAttendanceSheetStatus.class);
        attendanceSheetRepository.countByStatusForClassAndDateRange(
                request.classId(), request.startDate(), request.endDate())
                .forEach(row -> counts.put((WholeAttendanceSheetStatus) row[0], ((Number) row[1]).longValue()));
        long found = attendanceSheetRepository.countDistinctBySchoolClassClassIdAndDateBetween(
                request.classId(), request.startDate(), request.endDate());
        long sheetCount = counts.values().stream().mapToLong(Long::longValue).sum();
        long duplicateSheets = Math.max(0, sheetCount - found);
        long calendarDays = java.time.temporal.ChronoUnit.DAYS.between(
                request.startDate(), request.endDate()) + 1;
        long locked = counts.getOrDefault(WholeAttendanceSheetStatus.LOCKED, 0L);
        long submitted = counts.getOrDefault(WholeAttendanceSheetStatus.SUBMITTED, 0L);
        long draft = counts.getOrDefault(WholeAttendanceSheetStatus.DRAFT, 0L);
        return new AttendanceArchivePreview(
                request.classId(), request.startDate(), request.endDate(), calendarDays, sheetCount,
                duplicateSheets, locked, submitted, draft, Math.max(0, calendarDays - found),
                found > 0 && duplicateSheets == 0 && locked == sheetCount && submitted == 0 && draft == 0);
    }

    @Transactional(readOnly = true)
    public List<ArchiveRecordResponse> listArchives() {
        UUID schoolId = currentSchoolId();
        List<ArchiveRecordResponse> results = resultArchiveRepository.findAllBySchoolIdOrderByRequestedAtDesc(schoolId)
                .stream().map(this::toResponse).toList();
        List<ArchiveRecordResponse> attendance = attendanceArchiveRepository
                .findAllBySchoolIdOrderByRequestedAtDesc(schoolId).stream().map(this::toResponse).toList();
        return java.util.stream.Stream.concat(results.stream(), attendance.stream())
                .sorted(java.util.Comparator.comparing(ArchiveRecordResponse::requestedAt).reversed())
                .toList();
    }

    @Transactional
    public ArchiveRecordResponse retry(UUID archiveId) {
        UUID schoolId = currentSchoolId();
        ResultArchive resultArchive = resultArchiveRepository.findById(archiveId).orElse(null);
        if (resultArchive != null) {
            if (!resultArchive.getSchoolId().equals(schoolId)
                    || resultArchive.getStatus() != ArchiveStatus.FAILED) {
                throw new SchoolResourceNotFoundExceptionHandler("failed archive not found");
            }
            resultArchive.setStatus(ArchiveStatus.PENDING);
            resultArchive.setLastError(null);
            return toResponse(resultArchiveRepository.save(resultArchive));
        }
        AttendanceArchive attendanceArchive = attendanceArchiveRepository.findById(archiveId)
                .filter(archive -> archive.getSchoolId().equals(schoolId)
                        && archive.getStatus() == ArchiveStatus.FAILED)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("failed archive not found"));
        attendanceArchive.setStatus(ArchiveStatus.PENDING);
        attendanceArchive.setLastError(null);
        return toResponse(attendanceArchiveRepository.save(attendanceArchive));
    }

    private MarksSheet validateExpectedMarks(
            SubjectJoint joint, ResultArchiveRequest request, List<StudentProfile> expectedStudents) {
        MarksSheet sheet = marksSheetRepo.findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        joint.getId(), request.academicYear(), request.term(), request.examType())
                .orElseThrow(() -> new SchoolResourceBadInputExceptionHandler(
                        "missing marksheet for subject " + joint.getSubject().getSubjectName()));
        if (sheet.getStatus() != MarksSheetStatus.SUBMITTED && sheet.getStatus() != MarksSheetStatus.LOCKED) {
            throw new SchoolResourceBadInputExceptionHandler(
                    "marksheet is not submitted for subject " + joint.getSubject().getSubjectName());
        }

        var markedStudentIds = marksRepo.findAllByMarksSheetId(sheet.getId()).stream()
                .map(row -> row.getStudentProfile().getId())
                .collect(java.util.stream.Collectors.toSet());
        List<String> missingAdmissions = expectedStudents.stream()
                .filter(student -> !markedStudentIds.contains(student.getId()))
                .map(StudentProfile::getStudentAdm)
                .limit(10)
                .toList();
        if (!missingAdmissions.isEmpty()) {
            throw new SchoolResourceBadInputExceptionHandler(
                    "incomplete marks for " + joint.getSubject().getSubjectName()
                            + "; missing student records: " + String.join(", ", missingAdmissions));
        }
        return sheet;
    }

    private List<StudentProfile> getEligibleStudents(SubjectJoint joint, UUID classId) {
        if (joint.getSubjectType() == SubjectType.COMPULSORY) {
            return studentRepository.findAllBySchoolClassClassId(classId);
        }
        return studentSubjectSelectionRepo.findAllBySubjectJointId(joint.getId()).stream()
                    .map(StudentSubjectSelection::getStudentProfile)
                    .toList();
    }

    private UUID currentSchoolId() {
        return authenticatedUserService.currentUser().user().getSchoolId();
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate.isAfter(endDate)) {
            throw new SchoolResourceBadInputExceptionHandler("archive start date must not be after end date");
        }
        if (java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) > 366) {
            throw new SchoolResourceBadInputExceptionHandler("attendance archive ranges cannot exceed 367 calendar days");
        }
    }

    private ArchiveRecordResponse toResponse(ResultArchive archive) {
        return new ArchiveRecordResponse(
                archive.getId(), "RESULT", archive.getClassId(), archive.getClassName(), archive.getAcademicYear(), archive.getTerm(),
                archive.getExamType() == null ? null : archive.getExamType().name(), null, null,
                archive.getVersion(), archive.getStatus(), archive.getRequestedAt(), archive.getVerifiedAt(),
                archive.getDocumentSize(), archive.isCleanupEligible(), cleanupBlockers(archive.isCleanupEligible()),
                archive.getLastError());
    }

    private ArchiveRecordResponse toResponse(AttendanceArchive archive) {
        return new ArchiveRecordResponse(
                archive.getId(), "ATTENDANCE", archive.getClassId(), archive.getClassName(), null, null, null,
                archive.getStartDate(), archive.getEndDate(), archive.getVersion(), archive.getStatus(),
                archive.getRequestedAt(), archive.getVerifiedAt(), archive.getDocumentSize(),
                archive.isCleanupEligible(), cleanupBlockers(archive.isCleanupEligible()), archive.getLastError());
    }

    private List<String> cleanupBlockers(boolean eligible) {
        return eligible ? List.of() : List.of(
                "Raw-data cleanup is disabled by configuration.",
                "Historical analytics and reports still require structured source records.");
    }
}
