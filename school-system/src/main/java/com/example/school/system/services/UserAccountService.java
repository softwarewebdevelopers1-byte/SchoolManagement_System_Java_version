package com.example.school.system.services;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import com.example.school.system.DTO.CreateTeacherDTO;
import com.example.school.system.DTO.LoginTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.UserExistsExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.Teacher;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.TeacherRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtService;
import com.example.school.system.security.jwt.JwtValidation;

import jakarta.validation.Valid;

@Service
@Validated
public class UserAccountService {
    private final TeacherRepository teacherRepository;
    private final PasswordHashing passwordHashing;
    private final SchoolRepository schoolRepository;
    private JwtService jwtService;
    private JwtValidation jwtValidation;

    public UserAccountService(TeacherRepository teacherRepo, PasswordHashing passwordHashing, JwtService JwtService,
            JwtValidation jwtValidation,
            SchoolRepository schoolRepository) {
        this.teacherRepository = teacherRepo;
        this.passwordHashing = passwordHashing;
        this.jwtValidation = jwtValidation;
        this.jwtService = JwtService;
        this.schoolRepository = schoolRepository;

    }

    public SchoolApiResponse<?> SignUpUser(CreateTeacherDTO teacherDto, String token) {
        jwtValidation.validateTokenIssued(token);
        validateSignUp(teacherDto);
        teacherRepository.save(toTeacher(teacherDto));
        return SchoolApiResponse.success("Teacher " + " " + teacherDto.firstName() + " " + "registration successful");
    }

    // login user service
    public String LoginUser(@Valid LoginTeacherDTO teacherDTO) {
        var message = "Invalid email or password";
        if (!teacherRepository.existsByEmail(teacherDTO.email())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);
        }
        Teacher teacherFound = teacherRepository.findByEmail(teacherDTO.email());
        if (!passwordHashing.PasswordEncoder().matches(teacherDTO.password(), teacherFound.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);

        }
        var token = jwtService.GenerateToken(teacherFound);
        return token;

    }

    private void validateSignUp(CreateTeacherDTO teacherCreateTeacherDTO) {
        if (teacherRepository.existsByEmail(teacherCreateTeacherDTO.email())) {
            throw new UserExistsExceptionHandler("User already exists");
        }
    }

    private Teacher toTeacher(CreateTeacherDTO teacherCreateTeacherDTO) {
        Teacher teacher = new Teacher();
        // check if teacher exists
        teacher.setFirstName(teacherCreateTeacherDTO.firstName());
        teacher.setLastName(teacherCreateTeacherDTO.lastName());
        teacher.setEmail(teacherCreateTeacherDTO.email());
        teacher.setPassword(passwordHashing.PasswordEncoder().encode(teacherCreateTeacherDTO.password()));
        // check if school exists
        School findSchool = schoolRepository.findBySchoolName(teacherCreateTeacherDTO.schoolName().trim().toLowerCase())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("School Not Found"));
        teacher.setSchool(findSchool);
        teacher.setSchoolSettings(findSchool.getSchoolSettings());
        return teacher;
    }
}
