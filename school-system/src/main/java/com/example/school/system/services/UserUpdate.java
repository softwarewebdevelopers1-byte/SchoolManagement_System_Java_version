package com.example.school.system.services;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.UserUpdateDTO;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.error.SchoolResourceRestrictedException;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.security.jwt.JwtValidator;
import com.example.school.system.types.AccountStatus;

import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserUpdate {
    private final UserRepository userRepository;
    private final PasswordHashing passwordHashing;
    private final JwtValidator jwtValidator;

    @Transactional
    public SchoolApiResponse<?> updateUserDetails(UserUpdateDTO userUpdate, String token) {
        validateToken(token, userUpdate.userUuid().toString());
        Users user = userRepository.findById(userUpdate.userUuid())
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

    @Transactional
    public void deleteAccount(UUID id) {
        userRepository.findById(id).orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"))
                .setStatus(AccountStatus.DELETED);
        ;
    }

    @Transactional
    public void suspendAccount(UUID id) {
        userRepository.findById(id).orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"))
                .setStatus(AccountStatus.SUSPENDED);
        ;
    }

    @Transactional
    public void deActivateAccount(UUID id) {
        userRepository.findById(id).orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("user not found"))
                .setStatus(AccountStatus.INACTIVE);
        ;
    }

    private void validateToken(String token, String id) {
        Claims userToken = jwtValidator.validateTokenIssued(token);
        if (!id.equals(userToken.getSubject().toString())) {
            throw new SchoolResourceRestrictedException("forbidden");
        }
    }

}
