package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.OtpCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.OtpService;
import com.example.school.system.services.SchoolService;
import com.example.school.system.types.OtpPurpose;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/send/otp")
public class OtpController {
    private final OtpService otpService;
    private final SchoolService schoolService;

    @PostMapping("/")
    public SchoolApiResponse<?> otpSender(@Valid @RequestBody OtpCreationDTO otpCreationDTO) {
        return otpService.GenerateOtp(otpCreationDTO, OtpPurpose.REMINDER);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/delete/school/{id}/verification")
    public SchoolApiResponse<?> schoolOtpVerifier(@PathVariable UUID id,
            @RequestHeader("Authorization") String authHeader) {
        return schoolService.deleteRequestverifier(authHeader, id);
    }

    // @PostMapping("/validate/otp")
    // public SchoolApiResponse<?> otpValidator(@Valid @RequestBody OtpValidationDTO otp) {
    //     return SchoolApiResponse.success(otpService.ValidateOtp(otp));
    // }
}
