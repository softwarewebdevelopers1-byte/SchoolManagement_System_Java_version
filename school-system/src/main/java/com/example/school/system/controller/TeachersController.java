package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class TeachersController {
    public SchoolApiResponse<?> getAllStudents(@PathVariable UUID id) {
        
        return SchoolApiResponse.success();
    }
}
