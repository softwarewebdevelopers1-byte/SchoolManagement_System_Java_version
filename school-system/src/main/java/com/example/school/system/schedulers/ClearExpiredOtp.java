package com.example.school.system.schedulers;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.repository.OtpRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClearExpiredOtp {
    private final OtpRepository otpRepository;

    @Transactional
    @Scheduled(cron = "0 30 12 * * *", zone = "Africa/Nairobi")
    public void deleteExpOtp() {
        int deletedOtp = otpRepository.deleteAllByExpirationTimeAndUsedTrue(LocalDateTime.now());
        log.info("Deleted {} otps", deletedOtp);
    }
}

