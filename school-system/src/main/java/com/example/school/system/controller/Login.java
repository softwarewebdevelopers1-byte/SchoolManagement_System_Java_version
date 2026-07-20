package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.LoginUserDTO;
import com.example.school.system.DTO.DTOResponse.LoginResponse;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.LoginService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@RequestMapping("/api/auth/login")
@RequiredArgsConstructor
public class Login {
    private final LoginService loginUserService;

    @PostMapping("/login-user")
    public ResponseEntity<?> LoginTeacher(@Valid @RequestBody LoginUserDTO userLogin) {
        LoginResponse loginRes = loginUserService.LoginUser(userLogin);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(loginRes, "User logged in"));
    }

}
