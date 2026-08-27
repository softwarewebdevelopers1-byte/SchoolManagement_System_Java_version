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
@RequestMapping("/api/login")
@RequiredArgsConstructor
public class Login {
    private final LoginService loginUserService;

    @PostMapping
    public ResponseEntity<?> LoginTeacher(@Valid @RequestBody LoginUserDTO userLogin) {
        System.out.println("logged in");
        LoginResponse loginRes = loginUserService.LoginUser(userLogin);
        System.out.println("logging finished");
        return ResponseEntity.status(200).body(SchoolApiResponse.success(loginRes, "User logged in"));
    }

}
