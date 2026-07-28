package com.example.school.system.schedulers;

import java.time.LocalDateTime;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.repository.ExpiryLinksRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClearExpiredLinks {
    private final ExpiryLinksRepository expiryLinksRepository;

    @Transactional
    @Scheduled(cron = "0 30 12 * * *", zone = "Africa/Nairobi")
    public void deleteExpiredLinks() {
        int deleteLinks = expiryLinksRepository.deleteAllByExpirationTimeBeforeOrUsedTrue(LocalDateTime.now());
        log.info("Deleted {} tokens", deleteLinks);
    }
}
