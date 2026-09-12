package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.sms.TextBeeService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TextBeeController {
    private final TextBeeService textBeeService;

    @PostMapping("/send/sms")
    public ResponseEntity<?> SendSms() {
        textBeeService.sendBulkSms();
        return ResponseEntity.status(200).body(SchoolApiResponse.success());
    }
}
