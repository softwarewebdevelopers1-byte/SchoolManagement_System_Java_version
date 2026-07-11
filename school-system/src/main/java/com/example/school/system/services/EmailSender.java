package com.example.school.system.services;

import org.springframework.mail.MailException;
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

    public void SendEmail(String email, StringBuilder message) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setFrom("carlosmaina198@gmail.com");
            helper.setSubject("Edunex");
            helper.setText(buildHtmlContent(message.toString(), email), true);

            javaMailSender.send(mimeMessage);
        } catch (MailException | jakarta.mail.MessagingException e) {
            System.out.println(e.getMessage());
            throw new MailExceptionHandler("Unable to send email");
        }
    }

    private String buildHtmlContent(String message, String userEmail) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<style>"
                + "body{margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Arial,sans-serif;}"
                + ".container{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;border:1px solid #ddd;overflow:hidden;}"
                + ".header{padding:28px 24px;text-align:center;border-bottom:2px solid #000;}"
                + ".header h1{margin:0;font-size:24px;color:#000;letter-spacing:1px;}"
                + ".header p{margin:4px 0 0;font-size:13px;color:#666;}"
                + ".body{padding:32px;color:#222;font-size:15px;line-height:1.8;}"
                + ".body .msg-box{background:#f7f7f7;padding:16px 20px;border-left:3px solid #000;margin:12px 0 20px;border-radius:4px;}"
                + ".body .divider{border:none;border-top:1px solid #ddd;margin:20px 0;}"
                + ".body .btn{display:inline-block;padding:10px 30px;background:#000;color:#fff;text-decoration:none;border-radius:30px;font-weight:600;font-size:14px;}"
                + ".footer{padding:16px 24px;background:#f7f7f7;text-align:center;font-size:12px;color:#999;border-top:1px solid #ddd;}"
                + "@media only screen and (max-width:480px){.container{margin:16px;}.body{padding:24px;}}"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='container'>"
                + "<div class='header'>"
                + "<h1>📚 Edunex</h1>"
                + "<p>Empowering Education Through Technology</p>"
                + "</div>"
                + "<div class='body'>"
                + "<p><strong>Dear " + " " + userEmail + ",</strong></p>"
                + "<div class='msg-box'>" + message.replace("\n", "<br>") + "</div>"
                + "<p>Thank you for being part of the Edunex community.</p>"
                + "<hr class='divider'>"
                + "<div style='text-align:center;margin:16px 0;'>"
                + "<a href='https://elimupro.com' class='btn'>Visit Platform</a>"
                + "</div>"
                + "<p style='font-size:13px;color:#666;text-align:center;'>Contact: softwarewebdevelopers1@gmail.com</p>"
                + "</div>"
                + "<div class='footer'>"
                + "© " + java.time.Year.now() + "Edunex · Nairobi, Kenya"
                + "</div>"
                + "</div>"
                + "</body>"
                + "</html>";
    }
}

