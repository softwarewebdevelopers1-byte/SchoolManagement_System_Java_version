package com.example.school.system.error;

import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class SchoolNotFoundException extends RuntimeException {
    public SchoolNotFoundException(String message) {
        super(message);
    }

}
