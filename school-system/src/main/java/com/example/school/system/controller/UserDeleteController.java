package com.example.school.system.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DeleteAccountDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.UserDeleteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api")
@RequiredArgsConstructor
@RestController
public class UserDeleteController {
    private final UserDeleteService deleteAccountService;

    @PreAuthorize("hasAnyRole('ADMIN','CLASSTEACHER','HEADTEACHER','SUBJECTTEACHER')")
    @DeleteMapping("/danger-zone/delete/account")
    public ResponseEntity<?> deleteUser(@Valid @RequestBody DeleteAccountDTO dto) {
        SchoolApiResponse<?> deleteAccRes = deleteAccountService.deleteUser(dto.userId(), dto.email());
        return ResponseEntity.status(204).body(deleteAccRes);
    }
}
