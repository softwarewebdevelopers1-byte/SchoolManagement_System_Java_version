package com.example.school.system.services.email.listeners;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import com.example.school.system.services.email.EmailSender;
import com.example.school.system.services.email.events.ResetPasswordEvent;
import com.example.school.system.services.email.events.UserRegistrationEvent;

@Component
public class ApplicationListener {
    private EmailSender emailSender;

    public ApplicationListener(EmailSender emailSender) {
        this.emailSender = emailSender;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleRegistrationEmail(UserRegistrationEvent userRegistrationEvent) {
        StringBuilder welcomeMessage = new StringBuilder();
        welcomeMessage.append("👋 Welcome to Edunex!\n");
        welcomeMessage.append("We're happy to have you with us.\n\n");
        welcomeMessage.append("Best regards,\n");
        welcomeMessage.append("Edunex Team 🌟");
        emailSender.SendEmail(userRegistrationEvent.email(), welcomeMessage);
    }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void resetPasswordEmailer(ResetPasswordEvent resetPasswordEvent) {

    StringBuilder link = new StringBuilder();
    link.append("<a");
    link.append(" ");
    link.append("href");
    link.append("=");
    link.append("http://localhost:5173/forgot-password/");
    link.append(resetPasswordEvent.token());
    link.append(" ");
    link.append("style=\"display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; border: none; cursor: pointer;\"");
    link.append(">Reset Password</a>");
    
    emailSender.SendEmail(resetPasswordEvent.email(), link);
}
}

