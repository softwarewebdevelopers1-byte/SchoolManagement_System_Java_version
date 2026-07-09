package com.example.school.system.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.models.OTP;

public interface OtpRepository extends JpaRepository<OTP, Integer> {
    Optional<OTP> findOneByEmail(String email);

    @Transactional
    @Modifying
    long deleteByEmail(String email);
}
