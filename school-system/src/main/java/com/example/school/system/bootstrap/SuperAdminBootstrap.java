package com.example.school.system.bootstrap;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.school.system.models.Users;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class SuperAdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String email = "superadmin@edunex.com".trim().toLowerCase();
        String password = "SuperAdmin@123";

        if (userRepository.existsByEmail(email)) {
            return;
        }

        Users superAdmin = new Users();
        superAdmin.setEmail(email);
        superAdmin.setPassword(passwordEncoder.encode(password));
        superAdmin.setStatus(AccountStatus.ACTIVE);
        superAdmin.setRoles(java.util.Set.of(UserRoles.SUPERADMIN));
        userRepository.save(superAdmin);
    }
}
