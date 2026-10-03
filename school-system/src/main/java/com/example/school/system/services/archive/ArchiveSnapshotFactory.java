package com.example.school.system.services.archive;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.ParentResultsResponse;
import com.example.school.system.DTO.archive.ArchiveManifest;
import com.example.school.system.DTO.archive.ArchivedStudentResultSnapshot;
import com.example.school.system.DTO.archive.AttendanceSnapshot;
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
    private final ArchivePdfGenerator pdfGenerator;

    @Transactional(readOnly = true)
    public ArchivePayload buildResult(UUID archiveId) {
        ResultArchive archive = resultArchiveRepository.findById(archiveId)
                .orElseThrow(() -> new IllegalStateException("Result archive not found"));
        List<ClassTermResults> results =
                classTermResultsRepo.findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        archive.getClassId(), archive.getAcademicYear(), archive.getTerm(), archive.getExamType());
        if (results.isEmpty() || results.stream().anyMatch(result -> !result.isPublished())) {
            throw new IllegalStateException("Published result rows changed after result finalization");
        }

        List<MarksSheet> sheets = marksSheetRepo
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatusIn(
                        archive.getClassId(), archive.getAcademicYear(), archive.getTerm(), archive.getExamType(),
                        List.of(MarksSheetStatus.LOCKED));
        if (sheets.isEmpty()) {
            throw new IllegalStateException("Locked marksheets are missing for finalized result archive");
        }
        Map<UUID, List<ArchivedStudentResultSnapshot.Assessment>> assessmentsByStudent = new HashMap<>();
        for (MarksSheet sheet : sheets) {
            String subject = sheet.getSubjectJoint().getSubject().getSubjectName();
            String teacher = sheet.getSubjectJoint().getTeacherProfile() == null
                    ? null
                    : (sheet.getSubjectJoint().getTeacherProfile().getFirstName() + " "
                            + sheet.getSubjectJoint().getTeacherProfile().getLastName()).trim();
            for (MarksRow mark : sheet.getMarks()) {
                StudentProfile student = mark.getStudentProfile();
                assessmentsByStudent.computeIfAbsent(student.getId(), ignored -> new ArrayList<>())
                        .add(new ArchivedStudentResultSnapshot.Assessment(
                                subject, teacher, mark.getCat1(), mark.getCat2(), mark.getCat3(), mark.getExam(),
                                sheet.getMaxCat1(), sheet.getMaxCat2(), sheet.getMaxCat3(), sheet.getMaxExam(),
                                mark.getTotalMarks(), mark.getAverageMarksPercentage(), mark.getGrade(),
                                mark.getPoints()));
            }
        }

        String prefix = "schools/" + archive.getSchoolId() + "/results/" + archive.getId()
                + "/v" + archive.getVersion();
        List<ArchivePayload.StudentFile> studentFiles = new ArrayList<>();
        List<ArchiveManifest.StudentObject> manifestRows = new ArrayList<>();
        List<String[]> pdfRows = new ArrayList<>();
        pdfRows.add(new String[] { "Student", "Admission", "Total", "Average", "Grade", "Position" });
        for (ClassTermResults result : results) {
            UUID studentId = result.getStudentProfile().getId();
            ParentResultsResponse parentResult = resultAccessService.buildSnapshotFor(
                    studentId, archive.getAcademicYear(), archive.getTerm(), archive.getExamType());
            ArchivedStudentResultSnapshot snapshot = new ArchivedStudentResultSnapshot(
                    parentResult,
                    assessmentsByStudent.getOrDefault(studentId, List.of()).stream()
                            .sorted(java.util.Comparator.comparing(
                                    ArchivedStudentResultSnapshot.Assessment::subject,
                                    String.CASE_INSENSITIVE_ORDER))
                            .toList());
            byte[] content = serialize(snapshot);
            String key = prefix + "/students/" + studentId + ".json";
            String hash = ArchiveHash.sha256(content);
            studentFiles.add(new ArchivePayload.StudentFile(studentId, key, content, hash));
            manifestRows.add(new ArchiveManifest.StudentObject(studentId, key, hash, content.length));
            ParentResultsResponse.Student student = parentResult.student();
            pdfRows.add(new String[] {
                    student.name(), student.studentId(), String.valueOf(parentResult.summary().totalMarks()),
                    String.format(java.util.Locale.ROOT, "%.2f", parentResult.summary().average()),
                    parentResult.summary().overallGrade(), String.valueOf(student.position())
            });
        }

        ArchiveManifest manifest = new ArchiveManifest(
                "RESULT", archive.getId(), archive.getVersion(), archive.getSchoolId(), archive.getClassId(),
                archive.getAcademicYear() + "-T" + archive.getTerm() + "-" + archive.getExamType(),
                archive.getRequestedAt() == null ? Instant.now() : archive.getRequestedAt(), manifestRows);
        byte[] manifestBytes = serialize(manifest);
        byte[] pdf = pdfGenerator.generate(
                "Edunex Results - " + archive.getAcademicYear() + " Term " + archive.getTerm()
                        + " " + archive.getExamType(),
                pdfRows);
        return new ArchivePayload(manifestBytes, pdf, studentFiles,
                prefix + "/manifest.json", prefix + "/class-report.pdf");
    }

    @Transactional(readOnly = true)
    public AttendancePayload buildAttendance(UUID archiveId) {
        AttendanceArchive archive = attendanceArchiveRepository.findById(archiveId)
                .orElseThrow(() -> new IllegalStateException("Attendance archive not found"));
        List<AttendanceSheet> sheets = attendanceSheetRepository
                .findAllBySchoolClassClassIdAndDateBetweenOrderByDate(
                        archive.getClassId(), archive.getStartDate(), archive.getEndDate());
        if (sheets.isEmpty() || sheets.stream()
                .anyMatch(sheet -> sheet.getStatus() != WholeAttendanceSheetStatus.LOCKED)) {
            throw new IllegalStateException("Attendance archive contains a missing or unlocked sheet");
        }

        AttendanceSheet first = sheets.getFirst();
        var schoolClass = first.getSchoolClass();
        List<AttendanceSnapshot.Day> days = sheets.stream()
                .map(sheet -> new AttendanceSnapshot.Day(
                        sheet.getDate(),
                        sheet.getStatus(),
                        sheet.getAttendanceRecords().stream()
                                .map(record -> new AttendanceSnapshot.StudentRecord(
                                        record.getStudent().getId(),
                                        record.getStudent().getStudentFullName(),
                                        record.getStudent().getStudentAdm(),
                                        record.getStatus()))
                                .sorted(java.util.Comparator.comparing(
                                        AttendanceSnapshot.StudentRecord::name,
                                        String.CASE_INSENSITIVE_ORDER))
                                .toList()))
                .toList();
        AttendanceSnapshot snapshot = new AttendanceSnapshot(
                schoolClass.getSchool().getId(),
                schoolClass.getClassId(),
                schoolClass.getClassGrade() + " " + schoolClass.getClassStream(),
                archive.getStartDate(),
                archive.getEndDate(),
                days);
        byte[] snapshotBytes = serialize(snapshot);
        List<String[]> pdfRows = new ArrayList<>();
        pdfRows.add(new String[] { "Date", "Student", "Admission", "Status" });
        for (AttendanceSnapshot.Day day : days) {
            for (AttendanceSnapshot.StudentRecord student : day.students()) {
                pdfRows.add(new String[] { day.date().toString(), student.name(),
                        student.admissionNumber(), student.status().name() });
            }
        }
        String prefix = "schools/" + archive.getSchoolId() + "/attendance/" + archive.getId()
                + "/v" + archive.getVersion();
        byte[] pdf = pdfGenerator.generate(
                "Attendance " + snapshot.className() + " " + archive.getStartDate() + " to " + archive.getEndDate(),
                pdfRows);
        return new AttendancePayload(snapshotBytes, pdf,
                prefix + "/snapshot.json", prefix + "/attendance-report.pdf");
    }

    private byte[] serialize(Object value) {
        try {
            return objectMapper.writeValueAsBytes(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize archive snapshot", exception);
        }
    }

    public record AttendancePayload(byte[] snapshot, byte[] document, String snapshotKey, String documentKey) {
    }
}
