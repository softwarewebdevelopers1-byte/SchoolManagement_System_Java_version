package com.example.school.system.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.DTOResponse.TeacherEditDTO;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeachersService {
    private final UserRepository userRepository;
    private final SchoolClassRepository gradeRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordHashing passwordHashing;

    public List<Users> getStudents(UUID schoolId) {
        return userRepository.findAllBySchool(schoolId);
    }

    @Transactional
    public void EditTeacher(TeacherEditDTO editTeacher, UUID userId) {
        // 1. Find the user
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));

        // 2. Get the teacher profile - FIXED
        TeacherProfile teacher = user.getTeacherProfile(); // Direct access from user

        // 3. Check if teacher profile exists
        if (teacher == null) {
            throw new SchoolResourceNotFoundExceptionHandler("Teacher profile not found for user");
        }

        // 4. Update user fields
        if (editTeacher.email() != null) {
            if (userRepository.existsByEmail(editTeacher.email().trim().toLowerCase())) {
                throw new SchoolResourceExistsExceptionHandler("User already exists");
            }

            user.setEmail(editTeacher.email().trim().toLowerCase());
        }
        if (editTeacher.schoolClassId() != null) {
            var classFound = gradeRepository.findById(editTeacher.schoolClassId())
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
            teacher.setSchoolClass(classFound);
        }

        if (editTeacher.password() != null) {
            user.setPassword(passwordHashing.PasswordEncoder().encode(editTeacher.password()));
        }

        if (editTeacher.roles() != null && !editTeacher.roles().isEmpty()) {
            user.setRoles(editTeacher.roles());
        }

        if (editTeacher.status() != null) {
            user.setStatus(editTeacher.status());
        }

        // 5. Update teacher profile fields
        if (editTeacher.firstName() != null) {
            teacher.setFirstName(editTeacher.firstName().trim().toLowerCase());
        }

        if (editTeacher.lastName() != null) {
            teacher.setLastName(editTeacher.lastName().trim().toLowerCase());
        }

        // 6. Save both entities
        userRepository.save(user);
        teacherProfileRepository.save(teacher);
    }
};