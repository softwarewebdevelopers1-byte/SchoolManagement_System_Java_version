package com.example.school.system.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.sms.SmsMessage;
import com.example.school.system.services.sms.SmsSendResult;
import com.example.school.system.services.sms.SmsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TextBeeController {
    private final SmsService smsService;

    @PostMapping("/send/sms")
    public ResponseEntity<?> SendSms() {
        List<SmsSendResult> results = smsService.sendBulkSms(List.of(
                new SmsMessage("+254757475316", "Hi Alice"),
                new SmsMessage("+254746075902", "Hi Bob")));
        long rejected = results.stream().filter(result -> !result.isAccepted()).count();
        if (rejected > 0) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(SchoolApiResponse.error("Mobitech rejected " + rejected + " SMS request(s)"));
        }
        return ResponseEntity.status(200).body(SchoolApiResponse.success());
    }
}
