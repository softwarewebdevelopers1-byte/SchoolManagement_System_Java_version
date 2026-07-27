package com.example.school.system.schedulers;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.repository.UserRepository;
import com.example.school.system.types.AccountStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClearRejectedInvites {
    private final UserRepository userRepository;

    @Scheduled(cron = "0 0 23 * * *", zone = "Africa/Nairobi")
    @Transactional
    public void deleteInvites() {
        userRepository.deleteAllByStatus(AccountStatus.REJECTED_INVITE);
    }
}
