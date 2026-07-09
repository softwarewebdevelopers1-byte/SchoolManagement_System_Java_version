package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.LoginUser;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.UserAccountService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
public class Login {
    private final UserAccountService loginUserService;

    public Login(UserAccountService loginUserService) {
        this.loginUserService = loginUserService;
    }

    @PostMapping("/api/login-user")
    public SchoolApiResponse<?> LoginTeacher(@RequestBody LoginUser teacherDTO) {
        var token = loginUserService.LoginUser(teacherDTO);
        return SchoolApiResponse.success(token, "User logged in");
    }

}
