package com.example.school.system.services;

import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import com.example.school.system.error.MailExceptionHandler;

@Service
public class EmailSender {
    private final JavaMailSender javaMailSender;

    public EmailSender(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void SendEmail(String email, String message) {
        try {
            SimpleMailMessage emailMessage = new SimpleMailMessage();
            emailMessage.setTo(email);
            emailMessage.setFrom("carlosmaina198@gmail.com");
            emailMessage.setSubject("Elimu Pro");
            emailMessage.setText(message);
            javaMailSender.send(emailMessage);
        } catch (MailException e) {
            System.out.println(e.getMessage());
            throw new MailExceptionHandler("Unable to send email");
        }
    }
}
