package com.example.school.system.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.OtpCreationDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.OtpService;

import jakarta.validation.Valid;

@RestController
public class OtpController {
    private OtpService otpService;

    public OtpController(OtpService otpService) {
        this.otpService = otpService;
    }

    @PostMapping("/api/send/otp")
    public SchoolApiResponse<?> otpSender(@Valid @RequestBody OtpCreationDTO otpCreationDTO) {
        otpService.GenerateOtp(otpCreationDTO);
        return SchoolApiResponse.success("OTP sent successfully");
    }
}
