package com.example.school.system.services.email;

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
        } catch (MailExceptionHandler | jakarta.mail.MessagingException e) {
            throw new MailExceptionHandler("Unable to send email");
        }
    }

    private String buildHtmlContent(String message, String userEmail) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
                + "<style>"
                + "body{margin:0;padding:0;background:#f4f7fb;font-family:Segoe UI,Arial,sans-serif;}"
                + ".container{max-width:620px;margin:35px auto;background:#ffffff;border-radius:14px;overflow:hidden;"
                + "box-shadow:0 8px 25px rgba(0,0,0,.08);}"
                + ".header{padding:35px 30px;text-align:center;background:#ffffff;"
                + "border-bottom:1px solid #ececec;}"
                + ".body{padding:35px;color:#333;font-size:15px;line-height:1.8;}"
                + ".msg-box{background:#f8fbff;border-left:5px solid #2E8BFF;padding:18px;"
                + "border-radius:8px;margin:20px 0;}"
                + ".btn{display:inline-block;padding:13px 34px;background:#1F6FFF;"
                + "color:#fff !important;text-decoration:none;border-radius:30px;"
                + "font-weight:600;margin-top:10px;}"
                + ".footer{background:#f8f9fb;padding:20px;text-align:center;"
                + "font-size:12px;color:#777;border-top:1px solid #ececec;}"
                + "@media(max-width:600px){"
                + ".container{margin:15px;}"
                + ".body{padding:25px;}"
                + "}"
                + "</style>"
                + "</head>"

                + "<body>"

                + "<div class='container'>"

                + "<div class='header'>"

                + "<img src='https://softwarewebdevelopers1-byte.github.io/Edunex-images/EdunexImage.png' "
                + "alt='Edunex Logo' "
                + "style='width:220px;"
                + "max-width:90%;"
                + "height:auto;"
                + "display:block;"
                + "margin:0 auto;"
                + "border-radius:12px;'>"

                + "<div style='margin-top:12px;"
                + "font-size:15px;"
                + "color:#666;"
                + "letter-spacing:.5px;'>"
                + "Smarter Schools, Better Futures"
                + "</div>"

                + "</div>"

                + "<div class='body'>"

                + "<p style='margin-top:0;'>"
                + "<strong>Hello " + userEmail + ",</strong>"
                + "</p>"

                + "<div class='msg-box'>"
                + message.replace("\n", "<br>")
                + "</div>"

                + "<p>"
                + "Thank you for choosing <strong>Edunex</strong>. "
                + "We're committed to making school management smarter, simpler, and more connected."
                + "</p>"

                + "<div style='text-align:center;margin:35px 0;'>"
                + "<a class='btn' href='https://elimupro.com'>Visit Edunex</a>"
                + "</div>"

                + "<hr style='border:none;border-top:1px solid #e5e5e5;'>"

                + "<p style='font-size:13px;color:#666;text-align:center;'>"
                + "Need help? Contact us at "
                + "<strong>softwarewebdevelopers1@gmail.com</strong>"
                + "</p>"

                + "</div>"

                + "<div class='footer'>"
                + "© " + java.time.Year.now()
                + " Edunex • Nairobi, Kenya"
                + "<br>"
                + "Empowering Education Through Technology"
                + "</div>"

                + "</div>"

                + "</body>"
                + "</html>";
    }
}