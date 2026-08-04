package com.example.school.system.services;

import java.util.List;
import java.util.UUID;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.school.system.DTO.DTOResponse.AuthMapperDto;
import com.example.school.system.DTO.DTOResponse.AuthenticatedUserContext;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticatedUserService {
    private final UserRepository userRepository;
    private final AuthMapperDto authMapper;

    public AuthenticatedUserContext currentUser() {
        Users user = userRepository.findById(currentUserId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("Authenticated user was not found"));
        List<String> permissions = user.getRoles().stream()
                .map(role -> role.name())
                .sorted()
                .toList();
        return new AuthenticatedUserContext(authMapper.toUserDto(user), permissions);
    }

    public UUID currentUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        try {
            return UUID.fromString(String.valueOf(principal));
        } catch (IllegalArgumentException exception) {
            throw new SchoolResourceNotFoundExceptionHandler("Authenticated user was not found");
        }
    }
}
