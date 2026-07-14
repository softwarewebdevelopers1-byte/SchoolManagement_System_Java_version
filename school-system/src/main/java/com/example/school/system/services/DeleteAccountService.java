package com.example.school.system.services;

import org.springframework.stereotype.Service;

import com.example.school.system.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteAccountService {
    private final UserRepository userRepository;

    // public SchoolApiResponse<?> deleteUser(Long id){

    // }
}
