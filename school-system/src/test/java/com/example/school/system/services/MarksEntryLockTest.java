package com.example.school.system.services;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.DTO.MarksheetSaveRequest;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.models.ExamSettings;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.SchoolSettings;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.repository.MarksRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.MarksSheetStatus;
import com.example.school.system.types.SubjectType;

@ExtendWith(MockitoExtension.class)
class MarksEntryLockTest {
    @Mock private MarksRepo marksRepo;
    @Mock private SubjectJointRepo subjectJointRepo;
    @Mock private StudentRepository studentRepository;
    @Mock private StudentSubjectSelectionRepo studentSubjectSelectionRepo;
    @Mock private SchoolSettingsRepository settingsRepository;
    @Mock private MarksSheetRepo marksSheetRepo;
    @Mock private GradingService gradingService;

    private MarksEntryService service;

    @BeforeEach
    void setUp() {
        service = new MarksEntryService(
                marksRepo, subjectJointRepo, studentRepository, studentSubjectSelectionRepo,
                settingsRepository, marksSheetRepo, gradingService);
    }

    @Test
    void lockedMarksheetRejectsWritesBeforeReadingOrChangingMarks() {
        UUID schoolId = UUID.randomUUID();
        UUID classId = UUID.randomUUID();
        UUID jointId = UUID.randomUUID();
        SchoolSettings settings = new SchoolSettings();
        settings.setAcademicYear("2026");
        settings.setCurrentSchoolTerm(1);
        ExamSettings examSettings = new ExamSettings();
        examSettings.setExamType(ExamType.ENDTERM);
        settings.setExamSettings(examSettings);
        SchoolClass schoolClass = new SchoolClass();
        schoolClass.setClassId(classId);
        SubjectJoint joint = new SubjectJoint();
        joint.setId(jointId);
        joint.setSchoolClass(schoolClass);
        joint.setSubjectType(SubjectType.COMPULSORY);
        MarksSheet lockedSheet = new MarksSheet();
        lockedSheet.setStatus(MarksSheetStatus.LOCKED);

        when(settingsRepository.findBySchoolId(schoolId)).thenReturn(Optional.of(settings));
        when(subjectJointRepo.findById(jointId)).thenReturn(Optional.of(joint));
        when(studentRepository.findAllBySchoolClassClassId(classId)).thenReturn(List.of());
        when(marksSheetRepo.findBySubjectJointIdAndAcademicYearAndCurrentSchoolTermAndExamType(
                jointId, "2026", 1, ExamType.ENDTERM)).thenReturn(Optional.of(lockedSheet));

        assertThrows(SchoolResourceBadInputExceptionHandler.class,
                () -> service.saveMarks(new MarksheetSaveRequest(
                        jointId, schoolId, null, null, null, null, null, null, null, List.of(), null)));
        verify(marksRepo, never()).findAllByMarksSheetId(org.mockito.ArgumentMatchers.any());
        verify(marksRepo, never()).saveAll(org.mockito.ArgumentMatchers.any());
    }
}
