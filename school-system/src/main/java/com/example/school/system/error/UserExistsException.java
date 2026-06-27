package com.example.school.system.error;

import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class UserExistsException extends RuntimeException {
    public UserExistsException(String message) {
        super(message);
    }
}
