package com.example.school.system.schedulers;

import java.time.Instant;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.AccountStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class ClearUsers {
    private final UserRepository userRepository;

    @Transactional
    // delete accounts after 30 min
    @Scheduled(cron = "0 */30 * * * *", zone = "Africa/Nairobi")
    public void deleteAccounts() {
        Instant cutOff = Instant.now();
        int deleteAccounts = userRepository.deleteAllByStatusAndDeletedAtBefore(AccountStatus.DELETED, cutOff);
        log.info("Deleted {} accounts", deleteAccounts);
    }

    @Scheduled(cron = "0 00 08 * * *", zone = "Africa/Nairobi")
    @Transactional
    public void deleteAccountsRejected() {
        Instant cutOff = Instant.now();
        int deleteAccounts = userRepository.deleteAllByStatusAndDeletedAtBefore(AccountStatus.REJECTED_INVITE, cutOff);
        log.info("Deleted {} accounts", deleteAccounts);
    }
}

