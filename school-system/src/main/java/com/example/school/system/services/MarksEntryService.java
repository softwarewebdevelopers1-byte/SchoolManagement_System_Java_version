package com.example.school.system.services;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.MarkInputDTO;
import com.example.school.system.DTO.MarksRowDTO;
import com.example.school.system.DTO.MarksSheetDTO;
import com.example.school.system.DTO.MarksheetSaveRequest;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Marks;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.StudentSubjectSelection;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.types.SubjectType;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MarksEntryService {
    private final MarksRepo marksRepo;
    private final SubjectJointRepo subjectJointRepo;
    private final StudentRepository studentRepository;
    private final StudentSubjectSelectionRepo studentSubjectSelection;
    private final SchoolSettingsRepository settingsRepository;

    @Transactional
    public MarksSheetDTO loadMarksEntrySheet(UUID subjectJointId) {
        SubjectJoint subjectJoint = subjectJointRepo.findByIdWithoutSubjectType(subjectJointId, SubjectType.DROPPED)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        SchoolClass schoolClass = subjectJoint.getSchoolClass();

        List<StudentProfile> students = getStudentsForSubject(subjectJointId, subjectJoint);
        SchoolSettings schoolSettings = schoolClass.getSchool().getSchoolSettings();
        Map<UUID, Marks> existingMarks = marksRepo
                .findAllBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndCurrentSubTerm(subjectJointId,
                        schoolSettings.getAcademicYear(), schoolSettings.getCurrentSchoolTerm(),
                        schoolSettings.getCurrentSubTerm())
                .stream().collect(Collectors.toMap(m -> m.getStudentProfile().getId(), m -> m));

        List<MarksRowDTO> marksRow = students.stream().map(s -> {
            Marks marks = existingMarks.get(s.getId());
            return MarksRowDTO.builder().studentId(s.getId()).studentName(s.getStudentFullName())
                    .studentAdm(s.getStudentAdm())
                    .cat1(marks != null && marks.getCat1() != null ? marks.getCat1() : null)
                    .cat2(marks != null && marks.getCat2() != null ? marks.getCat2() : null)
                    .cat3(marks != null && marks.getCat3() != null ? marks.getCat3() : null)
                    .exam(marks != null && marks.getExam() != null ? marks.getExam() : null)
                    .build();
        }).toList();
        return MarksSheetDTO.builder().subjectJointId(subjectJointId)
                .subjectName(subjectJoint.getSubject().getSubjectName()).subjectType(subjectJoint.getSubjectType())
                .classId(schoolClass.getClassId())
                .className(schoolClass.getClassGrade() + " " + schoolClass.getClassStream())
                .electiveCode(subjectJoint.getElectiveCode()).marksRow(marksRow).build();
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

    public SchoolApiResponse<?> saveMarks(MarksheetSaveRequest marksheetSaveRequest) {
        SchoolSettings settings = settingsRepository.findBySchoolId(marksheetSaveRequest.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));
        SubjectJoint subjectJoint = subjectJointRepo.findById(marksheetSaveRequest.subjectJointId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));

        Set<UUID> validStudentIds = getStudentsForSubject(subjectJoint.getId(), subjectJoint).stream()
                .map(s -> s.getId()).collect(Collectors.toSet());
        marksheetSaveRequest.markInputDTOs().forEach(m -> {
            if (!validStudentIds.contains(m.studentId())) {
                throw new SchoolResourceNotFoundExceptionHandler("student not registered for this subject");
            }
            Marks mark = marksRepo
                    .findByStudentProfileIdAndSubjectJointIdAndAcademicYearAndCurrentSchoolTermAndCurrentSubTerm(
                            m.studentId(), subjectJoint.getId(), settings.getAcademicYear(),
                            settings.getCurrentSchoolTerm(), settings.getCurrentSubTerm())
                    .orElseGet(() -> new Marks());
            mark.setStudentProfile(studentRepository.findById(m.studentId())
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found")));
            mark.setAcademicYear(settings.getAcademicYear());
            mark.setCurrentSchoolTerm(settings.getCurrentSchoolTerm());
            mark.setCurrentSubTerm(settings.getCurrentSubTerm());
            if (m.cat1() != null) {
                mark.setCat1(m.cat1());
            }
            if (m.cat2() != null) {
                mark.setCat2(m.cat2());

            }
            if (m.cat3() != null) {
                mark.setCat3(m.cat3());

            }
            if (m.exam() != null) {
                mark.setExam(m.exam());

            }
            mark.setSubjectJoint(subjectJoint);
            // mark.setTotalMarks(claculate(m));
            marksRepo.save(mark);
        });
        return SchoolApiResponse.success("Marks saved successfully");
    }

    private Integer claculate(MarkInputDTO input) {
        return Stream.of(input.cat1(), input.cat2(), input.cat3(), input.exam()).filter(Objects::nonNull)
                .mapToInt(Integer::intValue).sum();
    }
}
