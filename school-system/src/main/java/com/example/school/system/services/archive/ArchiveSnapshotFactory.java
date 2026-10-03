package com.example.school.system.services.archive;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchiveManifest;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.DTO.archive.AttendanceSnapshot;
import com.example.school.system.DTO.archive.FrozenResultArchiveSnapshot;
import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.MarksRow;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.services.ResultAccessService;
import com.example.school.system.services.GradingService;
import com.example.school.system.types.MarksSheetStatus;
import com.example.school.system.types.WholeAttendanceSheetStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ArchiveSnapshotFactory {
    private final ObjectMapper objectMapper;
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;
    private final ClassTermResultsRepo classTermResultsRepo;
    private final MarksSheetRepo marksSheetRepo;
    private final AttendanceSheetRepository attendanceSheetRepository;
    private final ResultAccessService resultAccessService;
    private final GradingService gradingService;
    private final ArchivePdfGenerator pdfGenerator;

    public ArchivePayload buildResult(UUID archiveId) {
        ResultArchive archive = resultArchiveRepository.findById(archiveId)
                .orElseThrow(() -> new IllegalStateException("Result archive not found"));
        if (archive.getFrozenSnapshot() == null || archive.getFrozenSnapshot().isBlank()) {
            throw new IllegalStateException("Frozen result snapshot is missing for finalized archive");
        }
        FrozenResultArchiveSnapshot frozen = deserializeFrozenSnapshot(archive.getFrozenSnapshot());
        String prefix = "schools/" + archive.getSchoolId() + "/results/" + archive.getId()
                + "/v" + archive.getVersion();
        return new ArchivePayload(
                archive.getId(), frozen.version(), frozen.schoolId(), frozen.classId(),
                frozen.schoolName(), frozen.className(), frozen.academicYear(), frozen.term(),
                frozen.examType(), frozen.finalizedAt(), prefix, frozen.students());
    }

    public String freezeResult(ResultArchive archive, com.example.school.system.models.SchoolClass schoolClass) {
        List<ClassTermResults> results =
                classTermResultsRepo.findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        archive.getClassId(), archive.getAcademicYear(), archive.getTerm(), archive.getExamType());
        if (results.isEmpty() || results.stream().anyMatch(result -> !result.isPublished())) {
            throw new IllegalStateException("Published result rows changed before result finalization");
        }
        List<MarksSheet> sheets = new ArrayList<>();
        for (var period : com.example.school.system.types.ExamType.values()) {
            if (period.ordinal() > archive.getExamType().ordinal()) {
                continue;
            }
            sheets.addAll(marksSheetRepo
                    .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatusIn(
                            archive.getClassId(), archive.getAcademicYear(), archive.getTerm(), period,
                            List.of(MarksSheetStatus.SUBMITTED, MarksSheetStatus.LOCKED)));
        }
        if (sheets.isEmpty()) {
            throw new IllegalStateException("Submitted or locked marksheets are missing for finalized archive");
        }

        Map<UUID, List<ArchivedStudentResultSnapshot.Assessment>> assessmentsByStudent = new HashMap<>();
        for (MarksSheet sheet : sheets) {
            UUID subjectId = sheet.getSubjectJoint().getSubject().getId();
            String subject = sheet.getSubjectJoint().getSubject().getSubjectName();
            String teacher = sheet.getSubjectJoint().getTeacherProfile() == null
                    ? null
                    : (sheet.getSubjectJoint().getTeacherProfile().getFirstName() + " "
                            + sheet.getSubjectJoint().getTeacherProfile().getLastName()).trim();
            for (MarksRow mark : sheet.getMarks()) {
                StudentProfile student = mark.getStudentProfile();
                assessmentsByStudent.computeIfAbsent(student.getId(), ignored -> new ArrayList<>())
                        .add(new ArchivedStudentResultSnapshot.Assessment(
                                subjectId, subject, teacher, sheet.getExamType().name(),
                                mark.getCat1(), mark.getCat2(), mark.getCat3(), mark.getExam(),
                                sheet.getMaxCat1(), sheet.getMaxCat2(), sheet.getMaxCat3(), sheet.getMaxExam(),
                                mark.getTotalMarks(), mark.getAverageMarksPercentage(), mark.getGrade(),
                                mark.getPoints(), null, null));
            }
        }
        List<UUID> studentIds = results.stream().map(result -> result.getStudentProfile().getId()).toList();
        rankSubjectAssessments(assessmentsByStudent, java.util.Set.copyOf(studentIds));

        Map<UUID, ParentResultsResponse> parentResults = resultAccessService.buildSnapshotsFor(
                studentIds, archive.getAcademicYear(), archive.getTerm(), archive.getExamType());
        var scale = gradingService.getOrCreateDefaultScale(archive.getSchoolId());
        List<FrozenResultArchiveSnapshot.GradeDescriptor> gradingScale = scale.getBands().stream()
                .map(band -> new FrozenResultArchiveSnapshot.GradeDescriptor(
                        band.getGrade(), band.getMinScore(), band.getMaxScore(), band.getPoints(),
                        gradeDescription(band.getGrade())))
                .toList();
        var school = schoolClass.getSchool();
        Instant finalizedAt = Instant.now();
        List<ArchivedStudentResultSnapshot> students = new ArrayList<>();
        for (ClassTermResults publication : results) {
            UUID studentId = publication.getStudentProfile().getId();
            ParentResultsResponse result = parentResults.get(studentId);
            if (result == null) {
                throw new IllegalStateException("Published result snapshot is missing for a student");
            }
            result = withFinalizedComments(result);
            List<ArchivedStudentResultSnapshot.Assessment> assessments =
                    assessmentsByStudent.getOrDefault(studentId, List.of()).stream()
                            .sorted(java.util.Comparator.comparing(
                                    ArchivedStudentResultSnapshot.Assessment::subject,
                                    String.CASE_INSENSITIVE_ORDER))
                            .toList();
            students.add(new ArchivedStudentResultSnapshot(
                    result, assessments, gradingScale, school.getAddress(),
                    publication.getPublishedAt(), publication.getPublishedBy()));
        }
        FrozenResultArchiveSnapshot frozen = new FrozenResultArchiveSnapshot(
                archive.getId(), archive.getVersion(), archive.getSchoolId(),
                school.getSchoolName(), school.getAddress(), school.getEmail(), school.getPhoneNumber(),
                school.getSchoolMotto(), archive.getClassId(), archive.getClassName(),
                archive.getAcademicYear(), archive.getTerm(), archive.getExamType(),
                archive.getRequestedBy(), finalizedAt, gradingScale, students);
        try {
            return objectMapper.writeValueAsString(frozen);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to freeze finalized result snapshot", exception);
        }
    }

    private void rankSubjectAssessments(
            Map<UUID, List<ArchivedStudentResultSnapshot.Assessment>> assessmentsByStudent,
            java.util.Set<UUID> includedStudents) {
        Map<SubjectPeriod, List<StudentAssessment>> bySubject = new HashMap<>();
        assessmentsByStudent.forEach((studentId, assessments) -> {
            if (!includedStudents.contains(studentId)) {
                return;
            }
            assessments.forEach(assessment -> bySubject.computeIfAbsent(
                    new SubjectPeriod(assessment.subjectId(), assessment.period()), ignored -> new ArrayList<>())
                    .add(new StudentAssessment(studentId, assessment)));
        });
        Map<SubjectPeriod, Map<UUID, ArchivedStudentResultSnapshot.Assessment>> ranked = new HashMap<>();
        bySubject.forEach((subjectPeriod, marks) -> {
            List<StudentAssessment> ordered = marks.stream()
                    .sorted(java.util.Comparator.comparing(
                            (StudentAssessment item) ->
                                    item.assessment().percentage() == null
                                            ? Integer.MIN_VALUE
                                            : item.assessment().percentage())
                            .reversed())
                    .toList();
            Map<UUID, ArchivedStudentResultSnapshot.Assessment> subjectRanks = new HashMap<>();
            for (int i = 0; i < ordered.size(); i++) {
                StudentAssessment rankedAssessment = ordered.get(i);
                var mark = rankedAssessment.assessment();
                subjectRanks.put(rankedAssessment.studentId(),
                        new ArchivedStudentResultSnapshot.Assessment(
                                mark.subjectId(), mark.subject(), mark.teacher(), mark.period(), mark.cat1(), mark.cat2(),
                                mark.cat3(), mark.exam(), mark.maxCat1(), mark.maxCat2(), mark.maxCat3(),
                                mark.maxExam(), mark.total(), mark.percentage(), mark.grade(), mark.points(),
                                i + 1, ordered.size()));
            }
            ranked.put(subjectPeriod, subjectRanks);
        });
        assessmentsByStudent.replaceAll((studentId, assessments) -> assessments.stream()
                .map(assessment -> ranked
                        .getOrDefault(new SubjectPeriod(assessment.subjectId(), assessment.period()), Map.of())
                        .getOrDefault(studentId, assessment))
                .toList());
    }

    private ParentResultsResponse withFinalizedComments(ParentResultsResponse result) {
        String firstName = result.student().name() == null
                ? "Learner"
                : result.student().name().trim().split("\\s+")[0];
        String teacherComment = result.teacherComment() == null || result.teacherComment().isBlank()
                ? firstName + ", keep building on your progress through consistent effort and focus."
                : result.teacherComment();
        String principalComment = result.principalComment() == null || result.principalComment().isBlank()
                ? "Your performance is noted. Maintain discipline, focus and a positive attitude towards learning."
                : result.principalComment();
        return new ParentResultsResponse(
                result.student(), result.school(), result.term(), result.subjects(), result.summary(),
                result.attendance(), teacherComment, principalComment, result.nextTermBegins());
    }

    private String gradeDescription(String grade) {
        if (grade == null) {
            return "Unspecified performance level";
        }
        if (grade.startsWith("EE")) return "Exceeding Expectations";
        if (grade.startsWith("ME")) return "Meeting Expectations";
        if (grade.startsWith("AE")) return "Approaching Expectations";
        return "Below Expectations";
    }

    private FrozenResultArchiveSnapshot deserializeFrozenSnapshot(String value) {
        try {
            return objectMapper.readValue(value, FrozenResultArchiveSnapshot.class);
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Unable to read frozen result snapshot", exception);
        }
    }

    private record StudentAssessment(
            UUID studentId,
            ArchivedStudentResultSnapshot.Assessment assessment) {
    }

    private record SubjectPeriod(UUID subjectId, String period) {
    }

    public AttendancePayload buildAttendance(UUID archiveId, UUID leaseToken) {
        AttendanceArchive archive = attendanceArchiveRepository.findById(archiveId)
                .orElseThrow(() -> new IllegalStateException("Attendance archive not found"));
        List<AttendanceSheet> sheets = attendanceSheetRepository
                .findAllBySchoolClassClassIdAndDateBetweenOrderByDate(
                        archive.getClassId(), archive.getStartDate(), archive.getEndDate());
        if (sheets.isEmpty() || sheets.stream()
                .anyMatch(sheet -> sheet.getStatus() != WholeAttendanceSheetStatus.LOCKED)) {
            throw new IllegalStateException("Attendance archive contains a missing or unlocked sheet");
        }
        if (sheets.stream().map(AttendanceSheet::getDate).distinct().count() != sheets.size()) {
            throw new IllegalStateException("Attendance archive contains duplicate sheet dates");
        }

        AttendanceSheet first = sheets.getFirst();
        var schoolClass = first.getSchoolClass();
        List<AttendanceSnapshot.Day> days = sheets.stream().map(sheet -> {
            List<AttendanceSnapshot.StudentRecord> records = sheet.getAttendanceRecords().stream()
                    .map(record -> new AttendanceSnapshot.StudentRecord(
                            record.getStudent().getId(),
                            record.getStudent().getStudentFullName(),
                            record.getStudent().getStudentAdm(),
                            record.getStatus()))
                    .sorted(java.util.Comparator.comparing(
                            AttendanceSnapshot.StudentRecord::name,
                            String.CASE_INSENSITIVE_ORDER))
                    .toList();
            long distinctStudents = records.stream().map(AttendanceSnapshot.StudentRecord::studentId)
                    .distinct().count();
            if (records.isEmpty() || distinctStudents != records.size()) {
                throw new IllegalStateException("Attendance sheet has missing or duplicate student records");
            }
            int present = (int) records.stream()
                    .filter(record -> record.status() == com.example.school.system.types.ClassAttendanceStatus.PRESENT)
                    .count();
            int absent = (int) records.stream()
                    .filter(record -> record.status() == com.example.school.system.types.ClassAttendanceStatus.ABSENT)
                    .count();
            return new AttendanceSnapshot.Day(
                    sheet.getDate(), sheet.getStatus(), present, absent,
                    present * 100.0 / records.size(), records);
        }).toList();
        Map<UUID, AttendanceSnapshot.StudentSummary> studentSummaries = new HashMap<>();
        for (AttendanceSnapshot.Day day : days) {
            for (AttendanceSnapshot.StudentRecord record : day.students()) {
                AttendanceSnapshot.StudentSummary existing = studentSummaries.get(record.studentId());
                int presentDays = (existing == null ? 0 : existing.presentDays())
                        + (record.status() == com.example.school.system.types.ClassAttendanceStatus.PRESENT ? 1 : 0);
                int absentDays = (existing == null ? 0 : existing.absentDays())
                        + (record.status() == com.example.school.system.types.ClassAttendanceStatus.ABSENT ? 1 : 0);
                int recordedDays = (existing == null ? 0 : existing.recordedDays()) + 1;
                studentSummaries.put(record.studentId(), new AttendanceSnapshot.StudentSummary(
                        record.studentId(), record.name(), record.admissionNumber(), presentDays, absentDays,
                        recordedDays, presentDays * 100.0 / recordedDays));
            }
        }
        List<LocalDate> missingDates = archive.getStartDate().datesUntil(archive.getEndDate().plusDays(1))
                .filter(date -> sheets.stream().noneMatch(sheet -> sheet.getDate().equals(date)))
                .toList();
        if (!missingDates.isEmpty() && !archive.isMissingDatesConfirmed()) {
            throw new IllegalStateException(
                    "Attendance archive has dates without locked sheets; confirm and resolve its date coverage first");
        }
        String archivedClassName = archive.getClassName() == null || archive.getClassName().isBlank()
                ? schoolClass.getClassGrade() + " " + schoolClass.getClassStream()
                : archive.getClassName();
        AttendanceSnapshot snapshot = new AttendanceSnapshot(
                archive.getSchoolId(),
                archive.getSchoolName() == null ? schoolClass.getSchool().getSchoolName() : archive.getSchoolName(),
                archive.getClassId(),
                archivedClassName,
                archive.getStartDate(),
                archive.getEndDate(),
                archive.isMissingDatesConfirmed(),
                missingDates,
                days,
                studentSummaries.values().stream()
                        .sorted(java.util.Comparator.comparing(
                                AttendanceSnapshot.StudentSummary::name, String.CASE_INSENSITIVE_ORDER))
                        .toList());
        byte[] snapshotBytes = serialize(snapshot);
        int presentCount = days.stream().mapToInt(AttendanceSnapshot.Day::presentCount).sum();
        int absentCount = days.stream().mapToInt(AttendanceSnapshot.Day::absentCount).sum();
        int statusCount = presentCount + absentCount;
        Double attendanceRate = statusCount == 0 ? null : presentCount * 100.0 / statusCount;
        String prefix = "schools/" + archive.getSchoolId() + "/attendance/" + archive.getId()
                + "/v" + archive.getVersion() + "/attempts/" + leaseToken;
        byte[] pdf = pdfGenerator.generateAttendanceReport(snapshot, archive.getVersion(), archive.getRequestedAt());
        String snapshotKey = prefix + "/snapshot.json";
        String documentKey = prefix + "/attendance-report.pdf";
        ArchiveManifest manifest = new ArchiveManifest(
                "ATTENDANCE", archive.getId(), archive.getVersion(), archive.getSchoolId(), archive.getClassId(),
                archive.getStartDate() + " to " + archive.getEndDate(),
                archive.getRequestedAt() == null ? Instant.now() : archive.getRequestedAt(),
                "GENERATED_PENDING_VERIFICATION",
                List.of(
                        new ArchiveManifest.Artifact("ATTENDANCE_SNAPSHOT", null, snapshotKey, "application/json",
                                ArchiveHash.sha256(snapshotBytes), snapshotBytes.length),
                        new ArchiveManifest.Artifact("ATTENDANCE_PDF", null, documentKey, "application/pdf",
                                ArchiveHash.sha256(pdf), pdf.length)));
        byte[] manifestBytes = serialize(manifest);
        return new AttendancePayload(snapshotBytes, pdf, manifestBytes,
                snapshotKey, documentKey, prefix + "/manifest.json",
                snapshot.studentSummaries().size(), days.size(), missingDates.size(), attendanceRate);
    }

    public byte[] serialize(Object value) {
        try {
            return objectMapper.writeValueAsBytes(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize archive snapshot", exception);
        }
    }

    public record AttendancePayload(
            byte[] snapshot,
            byte[] document,
            byte[] manifest,
            String snapshotKey,
            String documentKey,
            String manifestKey,
            int studentCount,
            int recordedDays,
            int noSheetDays,
            Double attendanceRate) {
    }
}
