package com.example.school.system.controller;

import java.time.Duration;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.LoginUserDTO;
import com.example.school.system.DTO.DTOResponse.LoginResponse;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.LoginService;
import com.example.school.system.security.ApiRateLimitService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/login")
@RequiredArgsConstructor
public class Login {
    private final LoginService loginUserService;
    private final ApiRateLimitService rateLimitService;

    @PostMapping
    public ResponseEntity<?> LoginTeacher(@Valid @RequestBody LoginUserDTO userLogin) {
        var decision = rateLimitService.consume(
                "login-account",
                rateLimitService.normalizedIdentity(userLogin.email()),
                10,
                Duration.ofMinutes(15));
        if (!decision.allowed()) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .header("Retry-After", Long.toString(decision.retryAfterSeconds()))
                    .body(SchoolApiResponse.error("Too many login attempts. Please retry later."));
        }

        LoginResponse loginRes = loginUserService.LoginUser(userLogin);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(loginRes, "User logged in"));
    }

}
