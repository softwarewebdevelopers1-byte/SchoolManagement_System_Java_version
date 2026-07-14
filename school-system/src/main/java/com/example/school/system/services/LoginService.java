package com.example.school.system.services;

import org.springframework.stereotype.Service;

import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.jwt.SchoolResourceLockedExceptionHandler;
import com.example.school.system.DTO.LoginUserDTO;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.types.AccountStatus;

@Service
public class LoginService {
    private JwtCreationService jwtService;
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private RecaptchaService recaptchaService;

    public LoginService(JwtCreationService jwtService, UserRepository userRepository, PasswordHashing passwordHashing,
            RecaptchaService recaptchaService) {
        this.jwtService = jwtService;
        this.passwordHashing = passwordHashing;
        this.userRepository = userRepository;
        this.recaptchaService = recaptchaService;

    }

    // login user service
    public String LoginUser(LoginUserDTO user) {
        String message = "Invalid email or password";
        Users userFound = userRepository.findByEmail(user.email())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler(message));
        AccountStatus userStatus = userFound.getStatus();
        StringBuilder statusSender = new StringBuilder();
        if (userStatus.toString().contains("_")) {
            String[] userStatusSplitted = userStatus.toString().toLowerCase().split("_");
            statusSender.append(userStatusSplitted[0]);
            statusSender.append(" ");
            statusSender.append(userStatusSplitted[1]);
        } else {
            statusSender.append(userStatus.toString().toLowerCase());
        }

        if (!userStatus.equals(AccountStatus.ACTIVE)) {
            throw new SchoolResourceLockedExceptionHandler("Account is " + statusSender + " try again later");
        }
        if (!passwordHashing.PasswordEncoder().matches(user.password(), userFound.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler(message);

        }

        // if (!recaptchaService.validateRecaptchaToken(user.captchaToken())) {
        // throw new InvalidTokenExceptionHandler("Unable to validate recaptcha");
        // }
        var token = jwtService.GenerateToken(userFound);
        return token;
    }
}
