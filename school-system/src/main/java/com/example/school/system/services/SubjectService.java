package com.example.school.system.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.GetSubjectJointsForSubjectTeacher;
import com.example.school.system.DTO.RegisterSubjectJoint;
import com.example.school.system.DTO.SubjectDTO;
import com.example.school.system.DTO.SubjectJointRes;
import com.example.school.system.DTO.SubjectUpdateDTO;
import com.example.school.system.DTO.UnenrollMultipleStudents;
import com.example.school.system.DTO.DTOResponse.GetAllSubjectJointsDTO;
import com.example.school.system.DTO.DTOResponse.GetSubjectsDTORes;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.DTO.DTOResponse.SubjectJointClassDTO;
import com.example.school.system.DTO.DTOResponse.SubjectJointForTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SubjectJointSummaryDTO;
import com.example.school.system.DTO.DTOResponse.SubjectListDTO;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.SubjectType;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.StudentSubjectSelection;
import com.example.school.system.models.Subject;
// import lombok.AllArgsConstructor;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;
    private final SubjectJointRepo subjectJointRepo;
    private final TeacherProfileRepository teacherProfileRepository;
    private final StudentSubjectSelectionRepo studentSubjectSelectionRepo;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public SchoolApiResponse<?> createSingleSubject(SubjectDTO subjectCreationDTO) {
        subjectRepository.save(toSubject(subjectCreationDTO));
        return SchoolApiResponse.success(subjectCreationDTO, "Subject created successfully");
    }

    public SchoolApiResponse<?> createMultipleSubject(List<SubjectDTO> multipleSubjectCreation) {
        return multipleSubjectValidation(multipleSubjectCreation);
    }

    private Subject toSubject(SubjectDTO subjectCreationDTO) {
        School school = subjectValidation(subjectCreationDTO);
        Subject subject = new Subject();
        subject.setSubjectName(subjectCreationDTO.subjectName());
        subject.setSchool(school);
        return subject;
    }

    private School subjectValidation(SubjectDTO subjectCreationDTO) {
        if (subjectRepository.existsBySubjectNameAndSchoolId(subjectCreationDTO.subjectName(),
                subjectCreationDTO.schoolId())) {
            throw new SchoolResourceExistsExceptionHandler("subject already exists");
        }
        return schoolRepository.findById(subjectCreationDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
    }

    public SchoolApiResponse<?> updateSubject(SubjectUpdateDTO subjectDTO) {
        String subjectName = subjectDTO.subjectName().trim().toLowerCase();
        Subject subjectToUpdate = subjectRepository.findByIdAndSchoolId(subjectDTO.subjectId(),
                subjectDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not found"));
        if (!subjectName.equals(subjectToUpdate.getSubjectName()) && subjectName != null
                && subjectRepository.existsBySubjectNameAndSchoolId(subjectName, subjectDTO.schoolId())) {
            throw new SchoolResourceExistsExceptionHandler("subject already exists");
        }
        subjectToUpdate.setSubjectName(subjectName);
        subjectRepository.save(subjectToUpdate);
        return SchoolApiResponse.success("subject updated");
    }

    @Transactional
    public void subjectAssignment(UUID subjectJointId, UUID teacherId) {
        TeacherProfile teacherProfile = teacherProfileRepository.findById(teacherId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("teacher not found"));
        SubjectJoint subjectJoint = subjectJointRepo.findById(subjectJointId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        // if (subjectJoint.getTeacherProfile() != null) {
        // throw new SchoolResourceExistsExceptionHandler("subject already assigned");
        // }
        boolean teacherFirstAssignment = false;

        Users userProfile = teacherProfile.getTeacher();
        if (!userProfile.getRoles().contains(UserRoles.SUBJECTTEACHER)) {
            teacherFirstAssignment = true;
            userProfile.getRoles().add(UserRoles.SUBJECTTEACHER);
        }
        if (teacherFirstAssignment) {
            userRepository.save(userProfile);
        }
        subjectJoint.setTeacherProfile(teacherProfile);
        subjectJointRepo.save(subjectJoint);
    }

    @Transactional
    public void subjectUnassignment(UUID subjectJointId, UUID teacherId) {
        TeacherProfile teacherProfile = teacherProfileRepository.findById(teacherId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("teacher not found"));
        SubjectJoint subjectJoint = subjectJointRepo.findById(subjectJointId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        if (subjectJoint.getTeacherProfile() == null) {
            throw new SchoolResourceExistsExceptionHandler("no assigned teacher");
        }
        if (!subjectJoint.getTeacherProfile().getId().equals(teacherProfile.getId())) {
            throw new SchoolResourceNotFoundExceptionHandler("teacher assignment id mismatch");
        }
        if (teacherProfile.getSubjectJoints().isEmpty()) {
            Users userProfile = teacherProfile.getTeacher();
            userProfile.getRoles().remove(UserRoles.SUBJECTTEACHER);
            userRepository.save(userProfile);
        }
        subjectJoint.setTeacherProfile(null);
        subjectJointRepo.save(subjectJoint);
    }

    private SchoolApiResponse<?> multipleSubjectValidation(List<SubjectDTO> subjects) {
        HashSet<String> seenInRequest = new HashSet<>();
        List<String> skipped = new ArrayList<>();
        List<Subject> savedSubjects = new ArrayList<>();

        for (int i = 0; i < subjects.size(); i++) {
            String key = subjects.get(i).subjectName().toLowerCase();
            SubjectDTO subjectCreationDTO = subjects.get(i);
            if (!seenInRequest.add(key)) {
                skipped.add(key);
                continue;
            }
            if (subjectRepository.existsBySubjectNameAndSchoolId(subjects.get(i).subjectName(),
                    subjects.get(i).schoolId())) {
                skipped.add(key);
                continue;
            }
            savedSubjects.add(toSubject(subjectCreationDTO));
        }
        subjectRepository.saveAll(savedSubjects);
        return SchoolApiResponse.success(skipped, "checkout the skipped subjects in data object above");
    }

    public SchoolApiResponse<?> deleteSubject(UUID id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not found"));
        subjectRepository.delete(subject);
        return SchoolApiResponse.success("subject deleted");
    }

    @Transactional(readOnly = true)
    public SchoolApiResponse<?> getSubjects(UUID schoolId) {
        List<SubjectListDTO> subjects = subjectRepository.findSubjectSummariesBySchoolId(schoolId);
        return SchoolApiResponse.success(subjects, "subjects loaded successfully");
    }

    public void RegisterSubjectJoint(RegisterSubjectJoint registerSubjectJoint) {
        SchoolClass classFound = schoolClassRepository.findByClassId(registerSubjectJoint.classId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
        Subject subjectFound = subjectRepository.findById(registerSubjectJoint.subjectId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not found"));

        if (subjectJointRepo.existsBySubjectIdAndSchoolClassClassId(registerSubjectJoint.subjectId(),
                registerSubjectJoint.classId())) {
            throw new SchoolResourceExistsExceptionHandler("subject joint already exists");
        }
        SubjectJoint newSubjectJoint = new SubjectJoint();
        newSubjectJoint
                .setSubjectType(registerSubjectJoint.enrollmentMode() != null ? registerSubjectJoint.enrollmentMode()
                        : SubjectType.COMPULSORY);
        if (registerSubjectJoint.enrollmentMode() == SubjectType.ELECTIVE) {
            if (registerSubjectJoint.sharedSlotId() == null) {
                throw new SchoolResourceBadInputExceptionHandler("elective code is required");
            }
            newSubjectJoint.setElectiveCode(registerSubjectJoint.sharedSlotId());
        }
        newSubjectJoint.setSchoolClass(classFound);
        newSubjectJoint.setSubject(subjectFound);
        subjectJointRepo.save(newSubjectJoint);

    }

    @Transactional(readOnly = true)
    public List<SubjectJointSummaryDTO> getAllSubjectJoints(UUID schoolId) {
        return subjectJointRepo.findSubjectJointSummariesBySchoolId(schoolId);
    }

    public void registerStudentsToSubject(UUID studentId, UUID subjectJoint, UUID schoolId, String electiveCode) {
        StudentProfile studentProfile = studentRepository.findById(studentId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found"));
        SubjectJoint subjectJointFound = subjectJointRepo
                .findByIdAndElectiveCodeAndSubjectTypeAndSchoolClass_schoolId(subjectJoint, electiveCode,
                        SubjectType.ELECTIVE, schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        if (studentSubjectSelectionRepo.existsByElectiveCodeAndStudentProfileId(electiveCode, studentId)) {
            throw new SchoolResourceExistsExceptionHandler("Student already enrolled in the same elective pair");
        }
        StudentSubjectSelection subjectSelection = new StudentSubjectSelection();
        subjectSelection.setElectiveCode(electiveCode);
        subjectSelection.setStudentProfile(studentProfile);
        subjectSelection.setSubjectJoint(subjectJointFound);
        studentSubjectSelectionRepo.save(subjectSelection);
    }

    @Transactional
    public void registerMultipleStudentsToSubject(List<UUID> studentId, UUID subjectJoint, UUID schoolId,
            String electiveCode) {
        SubjectJoint subjectJointFound = subjectJointRepo
                .findByIdAndElectiveCodeAndSubjectTypeAndSchoolClass_schoolId(subjectJoint, electiveCode,
                        SubjectType.ELECTIVE, schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject joint not found"));
        List<StudentProfile> students = studentRepository.findAllById(studentId);
        if (students.size() != studentId.size()) {
            throw new SchoolResourceNotFoundExceptionHandler("some students not found");
        }

        List<UUID> alreadyEnrolled = studentSubjectSelectionRepo
                .findEnrolledStudentIdsByElectiveCodeAndStudentIds(electiveCode, studentId);
        if (!alreadyEnrolled.isEmpty()) {
            log.info("elective code {}, already enrolled student IDs: {}", electiveCode, alreadyEnrolled);
            throw new SchoolResourceExistsExceptionHandler(
                    "Some students already enrolled in the same elective pair");
        }

        List<StudentSubjectSelection> selections = students.stream().map(studentProfile -> {
            StudentSubjectSelection subjectSelection = new StudentSubjectSelection();
            subjectSelection.setElectiveCode(electiveCode);
            subjectSelection.setStudentProfile(studentProfile);
            subjectSelection.setSubjectJoint(subjectJointFound);
            return subjectSelection;
        }).toList();

        studentSubjectSelectionRepo.saveAll(selections);
    }

    public void updateSubjectJointStatus(UUID subjectJointId, SubjectType subjectType, String electiveCode) {
        SubjectJoint subjectJoint = subjectJointRepo.findById(subjectJointId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject not found"));
        if (subjectType == SubjectType.ELECTIVE) {
            if (electiveCode == null || electiveCode.isBlank()) {
                throw new SchoolResourceNotFoundExceptionHandler("joining code for elective subject is required");
            }
            subjectJoint.setElectiveCode(electiveCode);
        } else {
            if (subjectJoint.getSubjectType() == SubjectType.ELECTIVE) {
                studentSubjectSelectionRepo.deleteBySubjectJointId(subjectJointId);
            }
            subjectJoint.setElectiveCode(null);
        }
        subjectJoint.setSubjectType(subjectType != null ? subjectType : SubjectType.COMPULSORY);
        subjectJointRepo.save(subjectJoint);
    }
    
    @Transactional
    public void deleteSingleSubjectSelection(String electiveCode, UUID studentId) {
        if (!studentSubjectSelectionRepo.existsByElectiveCodeAndStudentProfileId(electiveCode, studentId)) {
            throw new SchoolResourceNotFoundExceptionHandler("student not registered");
        }
        studentSubjectSelectionRepo.deleteByElectiveCodeAndStudentProfileId(electiveCode, studentId);
    }

    @Transactional
    public SchoolApiResponse<?> deleteMultipleSubjectSelection(UnenrollMultipleStudents unenrollStudents) {
        unenrollStudents.getStudentIds().stream().forEach(u -> {
            log.info("students unenrolled {}", u);
            studentSubjectSelectionRepo.deleteByElectiveCodeAndStudentProfileId(
                    unenrollStudents.getEnrollmentCode(),
                    u);
        });
        return SchoolApiResponse.success("deleted above count of students");
    }

    @Transactional(readOnly = true)
    public List<SubjectJointClassDTO> getSubjectJointForClass(UUID classId) {
        return subjectJointRepo.findSummariesByClassId(classId);
    }

    @Transactional(readOnly = true)
    public List<SubjectJointForTeacherDTO> getSubjectJointForSubjectJointTeacher(UUID teacherProfileId,
            UUID schoolId) {
        return subjectJointRepo.findSummariesByTeacherProfileId(teacherProfileId);
    }
}
