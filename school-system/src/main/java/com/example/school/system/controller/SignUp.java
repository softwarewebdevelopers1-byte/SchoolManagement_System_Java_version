package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.CreateTeacherDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.UserAccountService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@RestController
public class SignUp {
    private UserAccountService accountService;

    public SignUp(UserAccountService userAccountService) {
        this.accountService = userAccountService;
    }

    @PostMapping("/api/create-account")
    public SchoolApiResponse<?> createAccount(@RequestHeader("Authorization") String userToken,
            @Valid @RequestBody CreateTeacherDTO teacherDto) {
        return accountService.SignUpUser(teacherDto,userToken);

    }

}
