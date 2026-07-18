package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.PasswordResetter;
import com.example.school.system.DTO.ResetPasswordEmailerDto;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.ResetPasswordService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResetPasswordController {
    private final ResetPasswordService resetPasswordService;

    @GetMapping("/reset/password/expiry-checker/{id}")
    public ResponseEntity<?> tokenExpirationChecker(@PathVariable String id) {
        var res = resetPasswordService.getToken(id);
        return ResponseEntity.status(200).body(res);
    }

    @PostMapping("/reset/password/request")
    public ResponseEntity<?> resetPasswordEmailer(@Valid @RequestBody ResetPasswordEmailerDto resetPasswordDto) {
        var emailRes = resetPasswordService.emailRequest(resetPasswordDto);
        return ResponseEntity.status(201).body(emailRes);
    }

    @PostMapping("/reset/password/token")
    public ResponseEntity<?> resetPasswordValidator(@Valid @RequestBody PasswordResetter passwordResetter,
            @RequestParam String token) {
        resetPasswordService.updatePassword(token, passwordResetter);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("Password reset successfully"));
    }
}
