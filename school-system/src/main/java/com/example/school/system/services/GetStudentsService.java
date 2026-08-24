package com.example.school.system.services;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.GetAllStudentsDTO;
import com.example.school.system.DTO.GetStudentsOfSpecificClass;
import com.example.school.system.DTO.DTOResponse.GetAllStudentsDTORes;
import com.example.school.system.DTO.DTOResponse.GetStudentByClassDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.StudentSubjectSelection;
import com.example.school.system.projection.StudentsLoaded;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.Gender;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GetStudentsService {
        private final SchoolClassRepository schoolClassRepository;
        private final StudentRepository studentProfileRepo;
        private final UserRepository userRepository;

        @Transactional
        public List<?> getStudentByClass(GetStudentsOfSpecificClass schoolClassDTO, int page, int size) {

                schoolClassRepository.findById(schoolClassDTO.classId())
                                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
                size = Math.min(size, 100);
                Pageable pageable = PageRequest.of(page, size);
                Page<StudentProfile> studentProfiles = studentProfileRepo.findBySchoolClassClassId(
                                schoolClassDTO.classId(),
                                pageable);
                List<?> students = studentProfiles.stream().map(s -> {
                        return GetStudentByClassDTO.builder()
                                        .enrolledSubjects(toEnrolledSubjects(s.getStudentSubjectSelections()))
                                        .id(s.getId()).status(s.getStudent().getStatus()).name(s.getStudentFullName())
                                        .adm(s.getStudentAdm())
                                        .gender(s.getGender() != null ? s.getGender() : Gender.NOT_SET)
                                        .guardianName(s.getGuardianName()).guardianPhone(s.getPhoneNumber())
                                        .email(s.getStudent().getEmail())
                                        .build();
                }).toList();

                return students;
        }

        private List<?> toEnrolledSubjects(List<StudentSubjectSelection> studentSubjectSelections) {
                return studentSubjectSelections.stream().map(e -> {
                        return e.getSubjectJoint().getId();
                }).toList();
        }

        public List<?> getAllStudents(GetAllStudentsDTO getAllStudentsDTO, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<StudentsLoaded> allStudents = userRepository.findLiveStudentsBySchoolIdWithRole(getAllStudentsDTO.schoolId(),
                                UserRoles.STUDENT,
                                pageable);

                return allStudents.stream().map(s -> {
                        return GetAllStudentsDTORes.builder()
                                        .studentFullName(s.getFullName())
                                        .guardianName(
                                                        s.getGuardianName())
                                        .gender(s.getGender())
                                        .studentAdm(s.getAdm())
                                        .phoneNumber(
                                                        s.getPhoneNumber())
                                        .status(s.getStatus()).userId(s.getUserId())
                                        .email(s.getEmail())
                                        .classGrade(s.getClassGrade().toString())
                                        .classStream(s.getClassStream())
                                        .classId(null)
                                        .build();
                }).toList();
        }

        public List<?> getAllExitedStudents(GetAllStudentsDTO getAllStudentsDTO, int page, int size) {
                Pageable pageable = PageRequest.of(page, size);
                Page<StudentsLoaded> allStudents = userRepository.findExitedStudentsBySchoolIdWithRole(getAllStudentsDTO.schoolId(),
                                UserRoles.STUDENT,
                                pageable);

                return allStudents.stream().map(s -> {
                        return GetAllStudentsDTORes.builder()
                                        .studentFullName(s.getFullName())
                                        .guardianName(
                                                        s.getGuardianName())
                                        .gender(s.getGender())
                                        .studentAdm(s.getAdm())
                                        .phoneNumber(
                                                        s.getPhoneNumber())
                                        .status(s.getStatus()).userId(s.getUserId())
                                        .email(s.getEmail())
                                        .classGrade(s.getClassGrade().toString())
                                        .classStream(s.getClassStream())
                                        .classId(null)
                                        .build();
                }).toList();
        }

}
