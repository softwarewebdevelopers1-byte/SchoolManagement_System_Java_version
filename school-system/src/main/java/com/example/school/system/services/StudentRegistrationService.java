package com.example.school.system.services;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.RegisterStudentDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.SchoolClass;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.StudentRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentRegistrationService {
    private final StudentRepository studentProfileRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final UserRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final SchoolRepository schoolRepository;

    @Transactional
    public SchoolApiResponse<?> registerStudent(RegisterStudentDTO registerStudentDTO) {
        School schoolFound = schoolRepository.findById(registerStudentDTO.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        // Validate and fetch class if provided
        SchoolClass schoolClass = null;
        if (registerStudentDTO.classId() != null) {
            schoolClass = schoolClassRepository.findById(registerStudentDTO.classId())
                    .orElseThrow(
                            () -> new SchoolResourceNotFoundExceptionHandler(
                                    "Class not found with ID: " + registerStudentDTO.classId()));
        }

        // Handle email: generate if null or empty
        String email = registerStudentDTO.email();
        if (email == null || email.trim().isEmpty()) {
            email = generateUniqueEmail();
        } else {
            // Check if email already exists in Users table
            if (usersRepository.existsByEmail(email)) {
                throw new SchoolResourceExistsExceptionHandler("Email already exists: " + email);
            }
        }

        // Handle admission number: generate if null or empty
        String studentAdm = registerStudentDTO.studentAdm();
        if (studentAdm == null || studentAdm.trim().isEmpty()) {
            studentAdm = generateUniqueAdmissionNumber();
        } else {
            // Check if admission number already exists in StudentProfile
            if (studentProfileRepository.existsByStudentAdm(studentAdm)) {
                throw new SchoolResourceNotFoundExceptionHandler("Admission number already exists: " + studentAdm);
            }
        }

        // Create Users account first
        Users user = new Users();
        // default password
        String studentPassword = "student";
        user.setEmail(email);
        user.setSchool(schoolFound);
        user.setPassword(passwordEncoder.encode(studentPassword));
        Set<UserRoles> studentRole = new HashSet<>();
        studentRole.add(UserRoles.STUDENT);
        user.setRoles(studentRole);
        user.setStatus(AccountStatus.ACTIVE);

        // Save user first
        Users savedUser = usersRepository.save(user);
        log.info("User account created with ID: {}", savedUser.getId());

        // Create student profile
        StudentProfile studentProfile = new StudentProfile();
        studentProfile.setStudentFullName(registerStudentDTO.studentFullName());
        studentProfile.setStudentAdm(studentAdm);
        studentProfile.setPhoneNumber(registerStudentDTO.phoneNumber());
        studentProfile.setSchoolClass(schoolClass);
        studentProfile.setStudent(savedUser); // Link to user account

        // Save student profile
        studentProfileRepository.save(studentProfile);
        return SchoolApiResponse.success("student registered successfully");
    }

    private String generateUniqueEmail() {
        String email;
        do {
            String randomPart = UUID.randomUUID().toString().substring(0, 8);
            email = "edunex-" + randomPart + "@school.edunex.com";
        } while (usersRepository.existsByEmail(email));
        return email;
    }

    private String generateUniqueAdmissionNumber() {
        String admNumber;
        do {
            String year = String.valueOf(java.time.Year.now().getValue());
            String randomPart = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            admNumber = "ADM-" + year + "-" + randomPart;
        } while (studentProfileRepository.existsByStudentAdm(admNumber));
        return admNumber;
    }
}
