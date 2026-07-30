package com.example.school.system.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.controller.admin.DTO.SignUpDTO;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.services.JwtCreationService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class ComplexLoginController {
    private final UserRepository userRepository;
    private final JwtCreationService jwtCreationService;
    private final PasswordHashing passwordHashing;

    @PostMapping("/complex/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody SignUpDTO signUpDTO) {
        Users userFound = userRepository.findByEmail(signUpDTO.email().trim().toLowerCase())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("Invalid email or password"));
        if (!passwordHashing.PasswordEncoder().matches(signUpDTO.password(), userFound.getPassword())) {
            throw new SchoolResourceNotFoundExceptionHandler("Invalid email or password");
        }
        var token = jwtCreationService.GenerateAdminToken(userFound);
        return ResponseEntity.status(200).body(SchoolApiResponse.success(token, "User logged in"));
    }
}

