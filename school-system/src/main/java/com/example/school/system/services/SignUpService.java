package com.example.school.system.services;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import com.example.school.system.DTO.SignUpUserDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.services.email.events.UserRegistrationEvent;

@Service
@Validated
public class SignUpService {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private ApplicationEventPublisher applicationEventPublisher;

    public SignUpService(UserRepository userRepo, PasswordHashing passwordHashing,
            SchoolRepository schoolRepository,
            ApplicationEventPublisher applicationEventPublisher) {
        this.userRepository = userRepo;
        this.passwordHashing = passwordHashing;
        this.applicationEventPublisher = applicationEventPublisher;

    }

    @Transactional
    public SchoolApiResponse<?> SignUpUser(SignUpUserDTO User, String token) {
        validateSignUp(User);
        userRepository.save(toUser(User));

        applicationEventPublisher.publishEvent(new UserRegistrationEvent(User.email()));
        return SchoolApiResponse.success("User " + " " + User.email() + " " + "registration successful");
    }

    private void validateSignUp(SignUpUserDTO userProfileDTO) {
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
