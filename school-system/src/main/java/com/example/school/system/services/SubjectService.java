package com.example.school.system.services;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.RegisterSubjectJoint;
import com.example.school.system.DTO.SubjectDTO;
import com.example.school.system.DTO.SubjectUpdateDTO;
import com.example.school.system.DTO.DTOResponse.GetAllSubjectJointsDTO;
import com.example.school.system.DTO.DTOResponse.GetSubjectsDTORes;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.repository.SubjectRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.types.SubjectType;

import lombok.RequiredArgsConstructor;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.Subject;
// import lombok.AllArgsConstructor;
import com.example.school.system.models.SubjectJoint;
import com.example.school.system.models.TeacherProfile;

@Service
@RequiredArgsConstructor
public class SubjectService {
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final SchoolRepository schoolRepository;
    private final SubjectJointRepo subjectJointRepo;
    private final TeacherProfileRepository teacherProfileRepository;

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
        if (subjectJoint.getTeacherProfile() != null) {
            throw new SchoolResourceExistsExceptionHandler("subject already assigned");
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

    public SchoolApiResponse<?> getSubjects(UUID schoolId) {
        schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        List<Subject> subjects = subjectRepository.findAllBySchoolId(schoolId);
        List<GetSubjectsDTORes> subjectsDTORes = toSubjectsDTORes(subjects);
        return SchoolApiResponse.success(subjectsDTORes, "subjects loaded successfully");
    }

    private List<GetSubjectsDTORes> toSubjectsDTORes(List<Subject> subjects) {
        List<GetSubjectsDTORes> subjectsDTORes = subjects.stream().map(s -> {
            return GetSubjectsDTORes.builder().subjectId(s.getId()).subjectName(s.getSubjectName()).build();
        }).toList();
        return subjectsDTORes;
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
        newSubjectJoint.setSubjectType(SubjectType.COMPULSORY);
        newSubjectJoint.setSchoolClass(classFound);
        newSubjectJoint.setSubject(subjectFound);
        subjectJointRepo.save(newSubjectJoint);
    }

    public List<?> getAllSubjectJoints(UUID schoolId) {
        List<SubjectJoint> subjectJoints = subjectJointRepo.findAllBySchoolClass_schoolId(schoolId);
        List<?> subjectJointsDto = subjectJoints.stream().map(sj -> {
            StringBuilder subjectTeacher = new StringBuilder();
            TeacherProfile teacherProfile = sj.getTeacherProfile();
            UUID teacherId = null;
            if (teacherProfile != null) {
                subjectTeacher.append(teacherProfile.getFirstName());
                subjectTeacher.append(" ");
                subjectTeacher.append(teacherProfile.getLastName());
                teacherId = teacherProfile.getId();
            }
            StringBuilder className = new StringBuilder();
            SchoolClass schoolClass = sj.getSchoolClass();
            className.append(schoolClass.getClassGrade());
            className.append(" ");
            className.append(schoolClass.getClassStream());
            return GetAllSubjectJointsDTO.builder().subjectName(sj.getSubject().getSubjectName()).className(className)
                    .subjectJointId(sj.getId()).subjectTeacherId(teacherId == null ? null : teacherId)
                    .subjectTeacherName(subjectTeacher.toString()).subjectType(sj.getSubjectType()).build();
        }).toList();
        return subjectJointsDto;
    }
}
