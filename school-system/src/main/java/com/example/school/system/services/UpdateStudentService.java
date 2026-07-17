package com.example.school.system.services;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.UpdateStudentDTO;
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

@Service
@RequiredArgsConstructor
public class UpdateStudentService {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private final SchoolClassRepository schoolClassRepository;
    private final StudentRepository studentRepository;

    @Transactional
    public void updateStudent(UpdateStudentDTO updateStudentDTO, UUID id) {
        Users student = userRepository.findByIdAndRolesContaining(id,UserRoles.STUDENT)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("student not found"));
        StudentProfile studentProfile = student.getStudentProfile();
        String studentEmail = updateStudentDTO.email();
        String studentPassword = updateStudentDTO.password();
        String fullName = updateStudentDTO.studentFullName();
        String studentAdm = updateStudentDTO.studentAdm();
        String phoneNumber = updateStudentDTO.phoneNumber();
        AccountStatus status = updateStudentDTO.status();
        UUID classId = updateStudentDTO.classId();
        if (studentEmail != null) {
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
        if (studentAdm != null && studentProfile != null) {
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
        userRepository.save(student);
        if (studentProfile != null) {
            studentRepository.save(studentProfile);
        }

    }
}
