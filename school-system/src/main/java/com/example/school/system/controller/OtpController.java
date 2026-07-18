package com.example.school.system.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.OtpCreationDTO;
import com.example.school.system.DTO.SchoolOtpVerifierDTO;
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
    public ResponseEntity<?> otpSender(@Valid @RequestBody OtpCreationDTO otpCreationDTO) {
        SchoolApiResponse<?> otpGenRes = otpService.GenerateOtp(otpCreationDTO, OtpPurpose.REMINDER);
        return ResponseEntity.status(201).body(otpGenRes);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/delete/school/verification")
    public ResponseEntity<?> schoolOtpVerifier(@RequestBody SchoolOtpVerifierDTO schoolOtpVerifierDTO,
            @RequestHeader("Authorization") String authHeader) {
        SchoolApiResponse<?> otpVerifierRes = schoolService.deleteRequestverifier(authHeader,
                schoolOtpVerifierDTO.id());
        return ResponseEntity.status(200).body(otpVerifierRes);
    }

    // @PostMapping("/validate/otp")
    // public SchoolApiResponse<?> otpValidator(@Valid @RequestBody OtpValidationDTO
    // otp) {
    // return SchoolApiResponse.success(otpService.ValidateOtp(otp));
    // }
}
