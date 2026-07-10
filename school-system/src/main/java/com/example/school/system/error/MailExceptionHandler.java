package com.example.school.system.error;

public class MailExceptionHandler extends RuntimeException {
    public MailExceptionHandler(String message) {
        super(message);
    }
}
