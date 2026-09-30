package com.example.school.system.services.sms;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.models.ResultSmsNotification;
import com.example.school.system.repository.ResultSmsNotificationRepository;
import com.example.school.system.types.SmsNotificationStatus;

@ExtendWith(MockitoExtension.class)
class ResultSmsNotificationServiceTest {
    @Mock
    private ResultSmsNotificationRepository notificationRepository;

    @Mock
    private SmsService smsService;

    private ResultSmsNotificationService service;

    @BeforeEach
    void setUp() {
        service = new ResultSmsNotificationService(notificationRepository, smsService);
    }

    @Test
    void recordsAcceptedAndRejectedRecipientsIndividually() {
        UUID acceptedId = UUID.randomUUID();
        UUID rejectedId = UUID.randomUUID();
        List<UUID> ids = List.of(acceptedId, rejectedId);
        ResultSmsNotification accepted = notification(acceptedId);
        ResultSmsNotification rejected = notification(rejectedId);
        List<ResultSmsNotification> notifications = List.of(accepted, rejected);

        when(notificationRepository.claimPending(
                ids, SmsNotificationStatus.PENDING, SmsNotificationStatus.SENDING))
                .thenReturn(2);
        when(notificationRepository.findAllByIdInAndStatus(ids, SmsNotificationStatus.SENDING))
                .thenReturn(notifications);
        when(smsService.sendBulkSms(org.mockito.ArgumentMatchers.anyCollection()))
                .thenReturn(List.of(
                        SmsSendResult.accepted("mobitech-accepted", "1000"),
                        SmsSendResult.rejected("1009", "Mobitech rejected the SMS request")));

        service.dispatch(ids);

        assertEquals(SmsNotificationStatus.ACCEPTED, accepted.getStatus());
        assertNull(accepted.getSentAt());
        assertEquals(SmsNotificationStatus.FAILED, rejected.getStatus());
        assertEquals("Mobitech rejected the SMS request", rejected.getLastError());
        verify(notificationRepository).saveAll(notifications);
    }

    private ResultSmsNotification notification(UUID id) {
        ResultSmsNotification notification = new ResultSmsNotification();
        notification.setId(id);
        notification.setRecipientPhone("+254700000001");
        notification.setMessage("Test notification");
        notification.setStatus(SmsNotificationStatus.SENDING);
        return notification;
    }
}
