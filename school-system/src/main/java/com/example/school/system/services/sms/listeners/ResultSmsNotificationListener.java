package com.example.school.system.services.sms.listeners;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.example.school.system.services.sms.ResultSmsNotificationService;
import com.example.school.system.services.sms.events.ResultSmsNotificationEvent;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ResultSmsNotificationListener {
    private final ResultSmsNotificationService notificationService;

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(ResultSmsNotificationEvent event) {
        notificationService.dispatch(event.notificationIds());
    }
}
