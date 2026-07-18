package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> ValidateUserToken(@PathVariable String token) {
        tokenService.validateTokenProvided(token);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("Token validation successful"));
    }

    @PostMapping("/api/token/sender")
    public ResponseEntity<?> TokenSender() {
        tokenService.TokenSaver();
        return ResponseEntity.status(201).body(SchoolApiResponse.success("Token generated successfully"));
    }
}