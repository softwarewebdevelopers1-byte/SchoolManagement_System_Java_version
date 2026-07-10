package com.example.school.system.services;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import com.example.school.system.error.MailExceptionHandler;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailSender {
    private final JavaMailSender javaMailSender;

    public EmailSender(JavaMailSender javaMailSender) {
        this.javaMailSender = javaMailSender;
    }

    public void SendEmail(String email, String message) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setFrom("carlosmaina198@gmail.com");
            helper.setSubject("Elimu Pro");
            helper.setText(buildHtmlEmail(message), true);

            javaMailSender.send(mimeMessage);
        } catch (Exception e) {
            System.out.println(e.getMessage());
            throw new MailExceptionHandler("Unable to send email");
        }
    }

    private String buildHtmlEmail(String message) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #f4f6f8;
                            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                        }
                        .email-wrapper {
                            max-width: 600px;
                            margin: 40px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
                        }
                        .email-header {
                            background: linear-gradient(135deg, #1e3a8a, #2563eb);
                            padding: 28px 32px;
                            text-align: center;
                        }
                        .email-header h1 {
                            color: #ffffff;
                            margin: 0;
                            font-size: 22px;
                            letter-spacing: 0.5px;
                        }
                        .email-body {
                            padding: 32px;
                            color: #1f2937;
                            font-size: 15px;
                            line-height: 1.6;
                        }
                        .email-footer {
                            padding: 20px 32px;
                            background-color: #f9fafb;
                            text-align: center;
                            font-size: 12px;
                            color: #9ca3af;
                            border-top: 1px solid #e5e7eb;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-wrapper">
                        <div class="email-header">
                            <h1>Elimu Pro</h1>
                        </div>
                        <div class="email-body">
                            %s
                        </div>
                        <div class="email-footer">
                            &copy; 2026 Elimu Pro. All rights reserved.
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(message);
    }
}