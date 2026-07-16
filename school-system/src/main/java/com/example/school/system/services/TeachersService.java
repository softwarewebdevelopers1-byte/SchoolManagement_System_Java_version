package com.example.school.system.services;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.DTOResponse.GetTeachersDTO;
import com.example.school.system.DTO.DTOResponse.TeacherEditDTO;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.TeacherProfile;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolClassRepository;
import com.example.school.system.repository.TeacherProfileRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtValidator;
import com.example.school.system.types.UserRoles;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TeachersService {
    private final UserRepository userRepository;
    private final SchoolClassRepository gradeRepository;
    private final TeacherProfileRepository teacherProfileRepository;
    private final PasswordHashing passwordHashing;
    private final JwtValidator jwtValidator;
    private String schoolNotFound = "school not found";

    public List<?> getTeachers(UUID id, String authHeader) {
        tokenIssuedValidator(id, authHeader);
        List<Users> users = userRepository.findUsersBySchoolWithoutRole(id, UserRoles.STUDENT);
        return users.stream().map(user -> {
            GetTeachersDTO teachersDTO = new GetTeachersDTO();
            teachersDTO.setEmail(user.getEmail());
            teachersDTO.setStatus(user.getStatus());
            teachersDTO.setRoles(user.getRoles());
            teachersDTO.setUsersId(user.getId());
            TeacherProfile profile = user.getTeacherProfile();
            if (profile != null) {
                teachersDTO.setFirstName(profile.getFirstName());
                teachersDTO.setLastName(profile.getLastName());
            }

            return teachersDTO;

        }).toList();
    }

    private void tokenIssuedValidator(UUID id, String authHeader) {
        Claims userToken = jwtValidator.validateTokenIssued(authHeader);
        if (!userToken.get("school").equals(id.toString())) {
            throw new SchoolResourceNotFoundExceptionHandler(schoolNotFound);
        }
    }

    public UUID schoolUuid(String token) {
        Claims userToken = jwtValidator.validateTokenIssued(token);
        String school = userToken.get("school").toString();
        return UUID.fromString(school);
    }

    @Transactional
    public void EditTeacher(TeacherEditDTO editTeacher, UUID userId, String authHeader) {
        // 1. Find the user
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        if (!schoolUuid(authHeader).equals(user.getSchool().getId())) {
            throw new SchoolResourceNotFoundExceptionHandler(schoolNotFound);
        }
        // 2. Get the teacher profile - FIXED
        TeacherProfile teacher = user.getTeacherProfile(); // Direct access from user

        // 4. Update user fields

        String newEmail = editTeacher.email();
        if (newEmail != null) {
            newEmail = newEmail.trim().toLowerCase();
            user.setEmail(newEmail);
        }
        if (!user.getEmail().equals(newEmail)
                && userRepository.existsByEmail(newEmail)) {
            throw new SchoolResourceExistsExceptionHandler("user already exists");
        }

        if (teacher != null && teacher.getSchoolClass().getClassId().equals(editTeacher.schoolClassId())
                && editTeacher.schoolClassId() != null) {
            var classFound = gradeRepository.findById(editTeacher.schoolClassId())
                    .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("class not found"));
            teacher.setSchoolClass(classFound);
        }

        if (editTeacher.password() != null) {
            user.setPassword(passwordHashing.PasswordEncoder().encode(editTeacher.password()));
        }

        if (editTeacher.roles() != null && !editTeacher.roles().isEmpty()) {
            Set<UserRoles> currentRoles = user.getRoles();
            Set<UserRoles> newRoles = editTeacher.roles();
            if (!currentRoles.equals(newRoles)) {
                user.getRoles().clear();
                user.setRoles(editTeacher.roles());
            }
        }

        if (!user.getStatus().equals(editTeacher.status()) && editTeacher.status() != null) {
            user.setStatus(editTeacher.status());
        }

        // 5. Update teacher profile fields
        if (teacher != null && !teacher.getFirstName().equals(editTeacher.firstName())
                && editTeacher.firstName() != null
                && teacher != null) {
            teacher.setFirstName(editTeacher.firstName().trim().toLowerCase());
        }

        if (teacher != null && !teacher.getLastName().equals(editTeacher.lastName()) && editTeacher.lastName() != null
                && teacher != null) {
            teacher.setLastName(editTeacher.lastName().trim().toLowerCase());
        }

        // 6. Save both entities
        userRepository.save(user);
        if (teacher != null)
            teacherProfileRepository.save(teacher);
    }
};
