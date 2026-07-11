package com.example.school.system.services.email.listeners;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import com.example.school.system.services.email.EmailSender;
import com.example.school.system.services.email.events.UserRegistrationEvent;

@Component
public class UserRegistrationListener {
    private EmailSender emailSender;

    public UserRegistrationListener(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(UserRegistrationEvent userRegistrationEvent) {
        StringBuilder welcomeMessage = new StringBuilder();
        welcomeMessage.append("👋 Welcome to Edunex!\n");
        welcomeMessage.append("We're happy to have you with us.\n\n");
        welcomeMessage.append("Best regards,\n");
        welcomeMessage.append("Edunex Team 🌟");
        emailSender.SendEmail(userRegistrationEvent.email(), welcomeMessage);
    }
}
