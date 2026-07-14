package com.example.school.system.controller;

import java.util.UUID;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DeleteAccountDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.UserDeleteAccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RequestMapping("/api/danger-zone/delete")
@RequiredArgsConstructor
@RestController
public class UserDeleteController {
    private final UserDeleteAccountService deleteAccountService;

    @DeleteMapping("/account/{id}")
    public SchoolApiResponse<?> deleteUser(@PathVariable UUID id,@Valid @RequestBody DeleteAccountDTO dto) {
        System.out.println(id);
        return deleteAccountService.deleteUser(id, dto.email());
    }
}
