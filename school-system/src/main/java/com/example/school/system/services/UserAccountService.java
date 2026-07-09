package com.example.school.system.services;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestHeader;
import com.example.school.system.DTO.User;
import com.example.school.system.DTO.LoginUser;
import com.example.school.system.DTO.OtpValidationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.UserExistsExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtFilter;
import jakarta.validation.Valid;

@Service
@Validated
public class UserAccountService {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private JwtCreationService jwtService;
    private JwtFilter jwtValidation;

    public UserAccountService(UserRepository userRepo, PasswordHashing passwordHashing,
            JwtCreationService JwtService,
            JwtFilter jwtValidation,
            SchoolRepository schoolRepository) {
        this.userRepository = userRepo;
        this.passwordHashing = passwordHashing;
        this.jwtValidation = jwtValidation;
        this.jwtService = JwtService;

    }

    public SchoolApiResponse<?> SignUpUser(User User, String token) {
        jwtValidation.validateTokenIssued(token);
        validateSignUp(User);
        userRepository.save(toTeacher(User));
        return SchoolApiResponse.success("User " + " " + User.email() + " " + "registration successful");
    }

    // login user service
    public String LoginUser(@Valid LoginUser user) {
        var message = "Invalid email or password";
        if (!userRepository.existsByEmail(user.email())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);
        }
        Users userFound = userRepository.findByEmail(user.email());
        if (!passwordHashing.PasswordEncoder().matches(user.password(), userFound.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);

        }
        var token = jwtService.GenerateTeacherToken(userFound);
        return token;

    }

    private void validateSignUp(User userProfileDTO) {
        if (userRepository.existsByEmail(userProfileDTO.email())) {
            throw new UserExistsExceptionHandler("User already exists");
        }
    }

    private Users toTeacher(User userProfileDTO) {
        Users teacher = new Users();
        // check if teacher exists
        teacher.setEmail(userProfileDTO.email());
        teacher.setPassword(passwordHashing.PasswordEncoder().encode(userProfileDTO.password()));
        return teacher;
    }

    public void deleteUserAccount(@RequestHeader("Authorization") String header, OtpValidationDTO otpDto) {

    }
}
