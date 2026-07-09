package com.example.school.system.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.SignUpUserDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.SignUpService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class SignUp {
    private SignUpService accountService;

    public SignUp(SignUpService userAccountService) {
        this.accountService = userAccountService;
    }

    @PostMapping("/api/create-account")
    public SchoolApiResponse<?> createAccount(@RequestParam String token,
            @Valid @RequestBody SignUpUserDTO user) {
        return accountService.SignUpUser(user, token);

    }

}
