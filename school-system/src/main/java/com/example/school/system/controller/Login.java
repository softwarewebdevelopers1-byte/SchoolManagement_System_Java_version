package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.LoginTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.LoginUserService;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class Login {
    private final LoginUserService loginUserService;

    public Login(LoginUserService loginUserService) {
        this.loginUserService = loginUserService;
    }

    @PostMapping("/login-user")
    public SchoolApiResponse<?> LoginTeacher(@RequestBody LoginTeacherDTO teacherDTO) {
        var userData = loginUserService.LoginUser(teacherDTO);
        return SchoolApiResponse.success(userData, "User logged in");
    }

}
