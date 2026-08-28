package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    @GetMapping("api/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("School Management System is running");
    }
}
