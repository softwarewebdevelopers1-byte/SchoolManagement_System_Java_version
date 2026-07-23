package com.example.school.system.services;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import com.example.school.system.DTO.MarksRowDTO;
import com.example.school.system.DTO.MarksSheetDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Marks;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.StudentSubjectSelection;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.repository.MarksRepo;
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
}
