package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.GradingClassStudents;
import com.example.school.system.DTO.GradingStreamStudents;
import com.example.school.system.services.RankingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class RankedController {

    private final RankingService rankingService;

    @PostMapping("/rank/class/students")
    @PreAuthorize("hasRole('CLASSTEACHER')")
    private ResponseEntity<?> rankResults(@Valid @RequestBody GradingClassStudents gradingClassStudents) {
        rankingService.StudentClassRanking(gradingClassStudents);
        return ResponseEntity.status(201).body("students ranked");
    }

    @PostMapping("/rank/all/students")
    @PreAuthorize("hasRole('ADMIN')")
    private ResponseEntity<?> publishResults(@Valid @RequestBody GradingStreamStudents gradingStreamStudents) {
        rankingService.StudentStreamRanking(gradingStreamStudents);
        return ResponseEntity.status(201).body("students globally ranked");
    }

}
