package com.example.school.system.services.sms;

import java.util.List;
import java.util.UUID;
import java.util.stream.IntStream;

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
    private final SmsService smsService;

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
            List<SmsSendResult> results = smsService.sendBulkSms(notifications.stream()
                    .map(notification -> new SmsMessage(
                            notification.getRecipientPhone(), notification.getMessage()))
                    .toList());
            if (results.size() != notifications.size()) {
                throw new IllegalStateException("SMS provider returned an incomplete bulk result");
            }
            IntStream.range(0, notifications.size()).forEach(index -> {
                ResultSmsNotification notification = notifications.get(index);
                SmsSendResult result = results.get(index);
                if (result.isAccepted()) {
                    notification.setStatus(SmsNotificationStatus.ACCEPTED);
                } else {
                    notification.setStatus(SmsNotificationStatus.FAILED);
                    notification.setLastError(truncate(result.errorMessage()));
                }
            });
            long rejected = results.stream().filter(result -> !result.isAccepted()).count();
            if (rejected > 0) {
                log.warn("Mobitech rejected {} of {} result notification SMS message(s)",
                        rejected, notifications.size());
            }
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
