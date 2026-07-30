package com.example.school.system.controller.admin;

import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.controller.admin.DTO.SignUpDTO;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.types.UserRoles;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/api")
public class ComplexSignUp {
    private final UserRepository UserRepository;
    private final PasswordHashing passwordHashing;

    @PostMapping("/complex/signup")
    public ResponseEntity<?> complexSignUpController(@Valid @RequestBody SignUpDTO signUpDTO) {
        if (UserRepository.existsByEmail(signUpDTO.email())) {
            throw new SchoolResourceBadInputExceptionHandler("user with that email already exists");
        }
        String hashedPassword = passwordHashing.PasswordEncoder().encode(signUpDTO.password());
        UserRepository.save(toUsers(hashedPassword, signUpDTO.email().trim().toLowerCase()));
        return ResponseEntity.status(204).body(SchoolApiResponse.success("User created"));
    }

    private Users toUsers(String password, String email) {
        Users user = new Users();
        Set<UserRoles> newRole = Set.of(UserRoles.SUPERADMIN);
        user.setRoles(newRole);
        user.setPassword(password);
        user.setEmail(email);
        return user;
    }
}


