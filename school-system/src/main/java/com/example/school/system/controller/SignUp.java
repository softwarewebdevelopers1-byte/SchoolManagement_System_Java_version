package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.SignUpUserDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SignUpService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class SignUp {
    private final SignUpService signUpService;

    @PostMapping("/teacher/create-account")
    public ResponseEntity<?> createAccount(
            @Valid @RequestBody SignUpUserDTO user) {
        SchoolApiResponse<?> res = signUpService.SignUpUser(user);
        return ResponseEntity.status(201).body(res);

    }

}
