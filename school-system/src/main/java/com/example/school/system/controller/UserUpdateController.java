package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.UserUpdateDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.UserUpdate;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserUpdateController {
    private final UserUpdate updateUser;

    @PreAuthorize("hasAnyRole('ADMIN','HEADTEACHER','CLASSTEACHER','DEPUTYTEACHER','SUBJECTTEACHER','STUDENT')")
    @PatchMapping("/update/user/{id}")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String authHeader, @PathVariable UUID id,
            @RequestBody UserUpdateDTO userUpdateDTO) {
        SchoolApiResponse<?> updateUserRes = updateUser.updateUserDetails(id, userUpdateDTO, authHeader);
        return ResponseEntity.status(200).body(updateUserRes);
    }
}
