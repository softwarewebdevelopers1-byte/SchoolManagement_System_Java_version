package com.example.school.system.services;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.AccountStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDeleteAccountService {
    private final UserRepository userRepository;

    public SchoolApiResponse<?> deleteUser(UUID id) {

        var user = userRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User noy found"));
        user.setStatus(AccountStatus.DELETED);

        userRepository.save(user);

        return SchoolApiResponse.success("User deleted");

    }
}
