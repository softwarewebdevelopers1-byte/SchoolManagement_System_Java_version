package com.example.school.system.services.sms;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.models.ResultSmsNotification;
import com.example.school.system.repository.ResultSmsNotificationRepository;
import com.example.school.system.types.SmsNotificationStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ResultSmsNotificationService {
    private final ResultSmsNotificationRepository notificationRepository;
    private final TextBeeService textBeeService;

    @Transactional
    public void dispatch(List<UUID> notificationIds) {
        if (notificationIds == null || notificationIds.isEmpty()) {
            return;
        }
        int claimed = notificationRepository.claimPending(
                notificationIds, SmsNotificationStatus.PENDING, SmsNotificationStatus.SENDING);
        if (claimed == 0) {
            return;
        }

        List<ResultSmsNotification> notifications = notificationRepository.findAllByIdInAndStatus(
                notificationIds, SmsNotificationStatus.SENDING);
        try {
            textBeeService.sendBulkSms(notifications.stream()
                    .map(notification -> new TextBeeService.SmsMessage(
                            notification.getRecipientPhone(), notification.getMessage()))
                    .toList());
            Instant sentAt = Instant.now();
            notifications.forEach(notification -> {
                notification.setStatus(SmsNotificationStatus.SENT);
                notification.setSentAt(sentAt);
            });
        } catch (RuntimeException exception) {
            notifications.forEach(notification -> {
                notification.setStatus(SmsNotificationStatus.FAILED);
                notification.setLastError(truncate(exception.getMessage()));
            });
            log.error("Failed to send {} result notification SMS message(s)", notifications.size(), exception);
        }
        notificationRepository.saveAll(notifications);
    }

    private String truncate(String value) {
        if (value == null) {
            return "SMS provider request failed";
        }
        return value.length() <= 1000 ? value : value.substring(0, 1000);
    }
}
