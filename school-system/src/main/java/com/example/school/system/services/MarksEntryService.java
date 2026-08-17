package com.example.school.system.services;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.MarkInputDTO;
import com.example.school.system.DTO.MarksRowDTO;
import com.example.school.system.DTO.MarksSheetDTO;
import com.example.school.system.DTO.MarksheetSaveRequest;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.academicsEvents.events.GradingClassStudents;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.GradeBand;
import com.example.school.system.models.GradingScale;
import com.example.school.system.models.MarksRow;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.StudentSubjectSelection;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.types.MarksSheetStatus;
import com.example.school.system.types.SubjectType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarksEntryService {
    private final MarksRepo marksRepo;
    private final SubjectJointRepo subjectJointRepo;
    private final StudentRepository studentRepository;
    private final StudentSubjectSelectionRepo studentSubjectSelection;
    private final SchoolSettingsRepository settingsRepository;
    private final MarksSheetRepo marksSheetRepo;
    private final GradingService gradingService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public MarksSheetDTO loadMarksEntrySheet(UUID subjectJointId) {
        SubjectJoint subjectJoint = subjectJointRepo.findByIdWithoutSubjectType(subjectJointId, SubjectType.DROPPED)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        SchoolClass schoolClass = subjectJoint.getSchoolClass();
        if (schoolClass == null) {
            throw new SchoolResourceNotFoundExceptionHandler("class not found");
        }
        List<StudentProfile> students = getStudentsForSubject(subjectJointId, subjectJoint);
        SchoolSettings schoolSettings = schoolClass.getSchool().getSchoolSettings();
        MarksSheet existingMarkSheet = marksSheetRepo
                .findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndExamType(subjectJointId,
                        schoolSettings.getAcademicYear(), schoolSettings.getCurrentSchoolTerm(),
                        schoolSettings.getExamSettings().getExamType())
                .orElseGet(() -> createMarksSheet(subjectJoint, schoolSettings, students));
        Map<UUID, MarksRow> existingMarks = new HashMap<>();
        if (existingMarkSheet.getId() != null) {
            Map<UUID, MarksRow> dbMarks = marksRepo.findAllByMarksSheetId(existingMarkSheet.getId()).stream()
                    .collect(Collectors.toMap(m -> m.getStudentProfile().getId(), m -> m));
            existingMarks.putAll(dbMarks);
        }
        List<MarksRowDTO> marksRow = students.stream().map(s -> {
            MarksRow marks = existingMarks.get(s.getId());
            return MarksRowDTO.builder().studentId(s.getId()).studentName(s.getStudentFullName())
                    .studentAdm(s.getStudentAdm()).cat1(marks != null ? marks.getCat1() : null)
                    .cat2(marks != null ? marks.getCat2() : null).cat3(marks != null ? marks.getCat3() : null)
                    .exam(marks != null ? marks.getExam() : null).marksGrade(marks != null ? marks.getGrade() : null)
                    .points(marks != null && marks.getPoints() != null ? marks.getPoints() : null)
                    .totalMarks(marks != null ? marks.getTotalMarks() : null)
                    .avgPercentage(marks != null ? String.valueOf(marks.getAverageMarksPercentage()) + "%" : null)
                    .build();
        }).toList();

        return MarksSheetDTO.builder().subjectJointId(subjectJointId)
                .subjectName(subjectJoint.getSubject().getSubjectName()).subjectType(subjectJoint.getSubjectType())
                .classId(schoolClass.getClassId())
                .className(schoolClass.getClassGrade() + " " + schoolClass.getClassStream())
                .electiveCode(subjectJoint.getElectiveCode()).marksRow(marksRow)
                .maxCat1(existingMarkSheet.isCat1Entry() ? existingMarkSheet.getMaxCat1() : null)
                .maxCat2(existingMarkSheet.isCat2Entry() ? existingMarkSheet.getMaxCat2() : null)
                .maxCat3(existingMarkSheet.isCat3Entry() ? existingMarkSheet.getMaxCat3() : null)
                .maxExam(existingMarkSheet.getMaxExam())
                .cat1Entry(existingMarkSheet.isCat1Entry())
                .cat2Entry(existingMarkSheet.isCat2Entry())
                .cat3Entry(existingMarkSheet.isCat3Entry())
                .examEntry(existingMarkSheet.isExamEntry())
                .build();
    }

    private MarksSheet createMarksSheet(SubjectJoint subjectJoint,
            SchoolSettings schoolSettings, List<StudentProfile> students) {
        MarksSheet newMarksSheet = new MarksSheet();
        newMarksSheet.setAcademicYear(schoolSettings.getAcademicYear());
        newMarksSheet.setCurrentSchoolTerm(schoolSettings.getCurrentSchoolTerm());
        newMarksSheet.setExamType(schoolSettings.getExamSettings().getExamType());
        ;
        newMarksSheet.setSubjectJoint(subjectJoint);
        return newMarksSheet;
    }

    private List<StudentProfile> getStudentsForSubject(UUID subjectJointId, SubjectJoint subjectJoint) {
        List<StudentProfile> studentProfiles;
        if (subjectJoint.getSubjectType() == SubjectType.COMPULSORY) {
            studentProfiles = studentRepository.findAllBySchoolClassClassId(subjectJoint.getSchoolClass().getClassId());
        } else {
            List<StudentSubjectSelection> selections = studentSubjectSelection.findAllBySubjectJointId(subjectJointId);
            studentProfiles = selections.stream().map(s -> {
                return s.getStudentProfile();
            }).toList();
        }
        return studentProfiles;
    }

    @Transactional
    public SchoolApiResponse<?> saveMarks(MarksheetSaveRequest marksheetSaveRequest) {
        SchoolSettings settings = settingsRepository.findBySchoolId(marksheetSaveRequest.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));
        SubjectJoint subjectJoint = subjectJointRepo.findById(marksheetSaveRequest.subjectJointId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        GradingScale gradingScale = gradingService.getOrCreateDefaultScale(marksheetSaveRequest.schoolId());
        UUID classId = subjectJoint.getSchoolClass().getClassId();
        Set<UUID> validStudentIds = getStudentsForSubject(subjectJoint.getId(), subjectJoint).stream()
                .map(s -> s.getId()).collect(Collectors.toSet());

        Integer totalSubjects = subjectJointRepo.countByclassIdWithoutSubjectType(classId,
                SubjectType.DROPPED);

        Integer submittedSheets = marksSheetRepo.countByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                classId, settings.getAcademicYear(), settings.getCurrentSchoolTerm(),
                settings.getExamSettings().getExamType(), MarksSheetStatus.SUBMITTED);

        MarksSheet marksSheet = marksSheetRepo
                .findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                        subjectJoint.getId(), settings.getAcademicYear(), settings.getCurrentSchoolTerm(),
                        settings.getExamSettings().getExamType())
                .orElseGet(() -> {
                    MarksSheet newMarksSheet = new MarksSheet();
                    newMarksSheet.setMaxExam(100);
                    newMarksSheet.setMaxCat1(40);
                    newMarksSheet.setMaxCat2(40);
                    newMarksSheet.setMaxCat3(40);
                    newMarksSheet.setSubjectJoint(subjectJoint);
                    newMarksSheet.setAcademicYear(settings.getAcademicYear());
                    newMarksSheet.setCurrentSchoolTerm(settings.getCurrentSchoolTerm());
                    newMarksSheet.setExamType(settings.getExamSettings().getExamType());
                    marksSheetRepo.save(newMarksSheet);
                    return newMarksSheet;
                });
        boolean rubricChanged = marksheetSaveRequest.maxCat1() != null
                && !Objects.equals(marksSheet.getMaxCat1(), marksheetSaveRequest.maxCat1())
                || marksheetSaveRequest.maxCat2() != null
                        && !Objects.equals(marksSheet.getMaxCat2(), marksheetSaveRequest.maxCat2())
                || marksheetSaveRequest.maxCat3() != null
                        && !Objects.equals(marksSheet.getMaxCat3(), marksheetSaveRequest.maxCat3())
                || marksheetSaveRequest.maxExam() != null
                        && !Objects.equals(marksSheet.getMaxExam(), marksheetSaveRequest.maxExam());

        if (rubricChanged) {
            if (marksheetSaveRequest.maxCat1() != null) {
                marksSheet.setMaxCat1(marksheetSaveRequest.maxCat1());
                marksSheet.setCat1Entry(true);
            }
            if (marksheetSaveRequest.maxCat2() != null) {
                marksSheet.setMaxCat2(marksheetSaveRequest.maxCat2());
                marksSheet.setCat2Entry(true);
            }
            if (marksheetSaveRequest.maxCat3() != null) {
                marksSheet.setMaxCat3(marksheetSaveRequest.maxCat3());
                marksSheet.setCat3Entry(true);
            }
            if (marksheetSaveRequest.maxExam() != null) {
                marksSheet.setMaxExam(marksheetSaveRequest.maxExam());
            }
        }

        // Handle explicit cat entry state changes (e.g. removing a cat)
        if (marksheetSaveRequest.cat1Entry() != null) {
            marksSheet.setCat1Entry(marksheetSaveRequest.cat1Entry());
            if (!marksheetSaveRequest.cat1Entry()) {
                marksSheet.setMaxCat1(null);
            }
            rubricChanged = true;
        }
        if (marksheetSaveRequest.cat2Entry() != null) {
            marksSheet.setCat2Entry(marksheetSaveRequest.cat2Entry());
            if (!marksheetSaveRequest.cat2Entry()) {
                marksSheet.setMaxCat2(null);
            }
            rubricChanged = true;
        }
        if (marksheetSaveRequest.cat3Entry() != null) {
            marksSheet.setCat3Entry(marksheetSaveRequest.cat3Entry());
            if (!marksheetSaveRequest.cat3Entry()) {
                marksSheet.setMaxCat3(null);
            }
            rubricChanged = true;
        }
        int skippedStudentsCount = 0;
        for (MarkInputDTO input : marksheetSaveRequest.markInputDTOs()) {
            if (!validStudentIds.contains(input.studentId())) {
                skippedStudentsCount++;
                continue;
            }
            log.info(String.valueOf(marksSheet.getMaxExam()));

            MarksRow marks = marksRepo.findByStudentProfileIdAndMarksSheetId(input.studentId(), marksSheet.getId())
                    .orElseGet(() -> {
                        MarksRow newMarks = new MarksRow();
                        newMarks.setMarksSheet(marksSheet);
                        newMarks.setStudentProfile(studentRepository.getReferenceById(input.studentId()));
                        return newMarks;
                    });
            boolean changed = false;
            if (!Objects.equals(marks.getCat1(), input.cat1())) {
                marks.setCat1(input.cat1());
                changed = true;
            }
            if (!Objects.equals(marks.getCat2(), input.cat2())) {
                marks.setCat2(input.cat2());
                changed = true;
            }
            if (!Objects.equals(marks.getCat3(), input.cat3())) {
                marks.setCat3(input.cat3());
                changed = true;
            }
            if (!Objects.equals(marks.getExam(), input.exam())) {
                marks.setExam(input.exam());
                changed = true;
            }
            calculate(marksSheet, marks, gradingScale);
            if (changed) {
                marksRepo.save(marks);
            }
        }
        marksSheet.setClassId(classId);
        marksSheet.setStatus(MarksSheetStatus.SUBMITTED);

        if (totalSubjects > 0 && totalSubjects == submittedSheets) {
            eventPublisher.publishEvent(GradingClassStudents.builder().classId(classId)
                    .academicYear(settings.getAcademicYear()).currentSchoolTerm(settings.getCurrentSchoolTerm())
                    .examType(settings.getExamSettings().getExamType()).gradingScale(gradingScale).build());
        }

        if (rubricChanged) {
            marksSheetRepo.save(marksSheet);
        }
        return SchoolApiResponse.success(skippedStudentsCount,
                "Marks saved successfully. Above is the count of unsaved students");
    }

    private void calculate(MarksSheet marksSheet, MarksRow marks,
            GradingScale gradingScale) {
        int maxPossible = 0;
        int scored = 0;
        if (marksSheet.isCat1Entry()) {
            maxPossible += marksSheet.getMaxCat1();
            if (marks.getCat1() != null) {
                scored += marks.getCat1();
            }
        }
        if (marksSheet.isCat2Entry()) {
            maxPossible += marksSheet.getMaxCat2();
            if (marks.getCat2() != null) {
                scored += marks.getCat2();
            }
        }
        if (marksSheet.isCat3Entry()) {
            maxPossible += marksSheet.getMaxCat3();
            if (marks.getCat3() != null) {
                scored += marks.getCat3();
            }
        }
        log.info(String.valueOf(marksSheet.isCat1Entry()));
        if (marksSheet.isExamEntry()) {
            maxPossible += marksSheet.getMaxExam();
            if (marks.getExam() != null)
                scored += marks.getExam();
        }
        marks.setTotalMarks(scored);
        if (maxPossible > 0) {
            double averangeMarks = ((double) scored / maxPossible) * 100;
            averangeMarks = Math.round(averangeMarks * 100) / 100;
            marks.setAverageMarksPercentage((int) averangeMarks);
        }
        gradingResults(marks, gradingScale);
    }

    private void gradingResults(MarksRow marksRow, GradingScale gradingScale) {
        GradeBand band = gradingScale.getBands().stream()
                .filter(b -> marksRow.getAverageMarksPercentage() >= b.getMinScore()
                        && marksRow.getAverageMarksPercentage() <= b.getMaxScore())
                .findFirst().orElseThrow(() -> new SchoolResourceBadInputExceptionHandler("Band out of range"));
        marksRow.setPoints(band.getPoints());
        marksRow.setGrade(band.getGrade());
    }
}
