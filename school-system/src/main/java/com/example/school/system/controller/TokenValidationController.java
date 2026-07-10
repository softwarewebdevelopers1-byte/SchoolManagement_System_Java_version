package com.example.school.system.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.services.TokenService;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;

@RestController
public class TokenValidationController {
    private TokenService tokenService;

    public TokenValidationController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping("/api/token/validation/{token}")
    public SchoolApiResponse<?> ValidateUserToken(@PathVariable String token) {
        tokenService.validateTokenProvided(token);
        return SchoolApiResponse.success("Token validation successful");
    }

    @PostMapping("/api/token/sender")
    public SchoolApiResponse<?> TokenSender() {
        tokenService.TokenSaver();
        return SchoolApiResponse.success("Token generated successfully");
    }
}