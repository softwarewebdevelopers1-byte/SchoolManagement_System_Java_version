package com.example.school.system.services;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.UserUpdateDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.SchoolResourceRestrictedException;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtValidator;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserUpdate {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private final JwtValidator jwtValidator;

    public SchoolApiResponse<?> updateUserDetails(UUID id, UserUpdateDTO userUpdate, String token) {
        // validateToken(token, id.toString());
        Users user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"));
        String email = userUpdate.email();
        String password = userUpdate.password();
        if (email != null) {
            email = email.trim().toLowerCase();
            if (userRepository.existsByEmail(email) && !email.equals(user.getEmail())) {
                throw new SchoolResourceExistsExceptionHandler("user with that email already exists");
            }
            user.setEmail(email);
        }
        if (password != null) {
            String userPassword = passwordHashing.PasswordEncoder().encode(password);
            user.setPassword(userPassword);
        }
        userRepository.save(user);
        return SchoolApiResponse.success("User updated");
    }

    private void validateToken(String token, String id) {
        Claims userToken = jwtValidator.validateTokenIssued(token);
        if (!id.equals(userToken.getSubject().toString())) {
            throw new SchoolResourceRestrictedException("forbidden");
        }
    }
}
