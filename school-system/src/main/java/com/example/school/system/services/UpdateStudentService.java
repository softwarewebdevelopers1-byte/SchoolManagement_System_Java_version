package com.example.school.system.services;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.UpdateStudentDTO;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class UpdateStudentService {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private final SchoolClassRepository schoolClassRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public void updateStudent(UpdateStudentDTO updateStudentDTO) {
        log.info("Id update trial {}, student details \n name: {} \n email: {} \n status: {} ",
                updateStudentDTO.studentId(),
                updateStudentDTO.studentFullName(), updateStudentDTO.email(), updateStudentDTO.status());
        Users student = userRepository.findByIdAndRolesContaining(updateStudentDTO.studentId(), UserRoles.STUDENT)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found"));
        StudentProfile studentProfile = student.getStudentProfile();
        String studentEmail = updateStudentDTO.email();
        String studentPassword = updateStudentDTO.password();
        String fullName = updateStudentDTO.studentFullName();
        String studentAdm = updateStudentDTO.studentAdm();
        String phoneNumber = updateStudentDTO.phoneNumber();
        AccountStatus status = updateStudentDTO.status();
        UUID classId = updateStudentDTO.classId();
        if (studentEmail != null && studentEmail != "" && !student.getEmail().equals(studentEmail)) {
            if (userRepository.existsByEmail(studentEmail)) {
                throw new SchoolResourceExistsExceptionHandler("student with that email already exists");
            }
            studentEmail = studentEmail.trim().toLowerCase();
            student.setEmail(studentEmail);
        }
        if (studentPassword != null) {
            studentPassword = studentPassword.trim();
            student.setPassword(passwordHashing.PasswordEncoder().encode(studentPassword));
        }
        if (fullName != null && studentProfile != null) {
            fullName = fullName.trim().toLowerCase();
            studentProfile.setStudentFullName(fullName);
        }
        if (studentAdm != null && studentProfile != null && !studentProfile.getStudentAdm().equals(studentAdm)) {
            if (studentRepository.existsByStudentAdm(studentAdm)) {
                throw new SchoolResourceExistsExceptionHandler("student with that email already exists");
            }
            studentAdm = studentAdm.trim();
            studentProfile.setStudentAdm(studentAdm);
        }
        if (phoneNumber != null && studentProfile != null) {
            phoneNumber = phoneNumber.trim();
            studentProfile.setPhoneNumber(phoneNumber);
        }
        if (status != null) {
            student.setStatus(status);
        }
        if (classId != null && studentProfile != null) {
            SchoolClass studentClass = schoolClassRepository.findById(classId)
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
            studentProfile.setSchoolClass(studentClass);
        }

    }
}
