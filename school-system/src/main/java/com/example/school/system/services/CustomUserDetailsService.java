package com.example.school.system.services;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private UserRepository repository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.repository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = repository.findByEmail(username)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("User not found"));
        String[] userRoles = user.getRoles().stream().map(role -> role.name()).toArray(String[]::new);
        return User.builder().username(user.getEmail()).password(user.getPassword()).roles(userRoles).build();
    }
}
