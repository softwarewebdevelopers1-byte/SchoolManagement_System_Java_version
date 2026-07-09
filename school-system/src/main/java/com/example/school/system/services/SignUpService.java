package com.example.school.system.services;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import com.example.school.system.DTO.SignUpUserDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;

@Service
@Validated
public class SignUpService {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;

    public SignUpService(UserRepository userRepo, PasswordHashing passwordHashing,
            SchoolRepository schoolRepository) {
        this.userRepository = userRepo;
        this.passwordHashing = passwordHashing;

    }

    public SchoolApiResponse<?> SignUpUser(SignUpUserDTO User, String token) {
        validateSignUp(User,token);
        userRepository.save(toUser(User));
        return SchoolApiResponse.success("User " + " " + User.email() + " " + "registration successful");
    }

    private void validateSignUp(SignUpUserDTO userProfileDTO, String token) {
        if (userRepository.existsByEmail(userProfileDTO.email())) {
            throw new SchoolResourceExistsExceptionHandler("User already exists");
        }
    }

    private Users toUser(SignUpUserDTO userProfileDTO) {
        Users user = new Users();
        // check if user exists
        user.setEmail(userProfileDTO.email());
        user.setPassword(passwordHashing.PasswordEncoder().encode(userProfileDTO.password()));
        return user;
    }
}
