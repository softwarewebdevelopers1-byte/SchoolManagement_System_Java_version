package com.example.school.system.services;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;
import com.example.school.system.DTO.SignUpUserDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.School;
import com.example.school.system.models.Users;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.services.email.events.UserRegistrationEvent;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.SchoolStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Validated
public class SignUpService {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final SchoolRepository schoolRepository;

    @Transactional
    public SchoolApiResponse<?> SignUpUser(SignUpUserDTO User) {
        validateSignUp(User);
        SetUserFields(User);
        applicationEventPublisher.publishEvent(new UserRegistrationEvent(User.email()));
        return SchoolApiResponse.success("User " + " " + User.email() + " " + "registration successful");
    }

    private void validateSignUp(SignUpUserDTO userProfileDTO) {
        if (userRepository.existsByEmail(userProfileDTO.email())) {
            throw new SchoolResourceExistsExceptionHandler("User already exists");
        }
    }

    private void SetUserFields(SignUpUserDTO userProfileDTO) {
        Users user = new Users();
        School userSchool = schoolRepository
                .findBySchoolCodeAndStatus(userProfileDTO.schoolCode(), SchoolStatus.ACTIVE)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found or is not active"));

        // set all required values
        user.setEmail(userProfileDTO.email());
        user.setSchool(userSchool);
        user.setStatus(AccountStatus.PENDING_VERIFICATION);
        user.setPassword(passwordHashing.PasswordEncoder().encode(userProfileDTO.password()));
        userRepository.save(user);
    }
}
