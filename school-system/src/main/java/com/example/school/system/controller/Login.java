package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.LoginUserDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.LoginService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class Login {
    private final LoginService loginUserService;

    public Login(LoginService loginUserService) {
        this.loginUserService = loginUserService;
    }

    @PostMapping("/api/login-user")
    public SchoolApiResponse<?> LoginTeacher(@Valid @RequestBody LoginUserDTO userLogin) {
        var token = loginUserService.LoginUser(userLogin);
        return SchoolApiResponse.success(token, "User logged in");
    }

}
