package com.example.school.system.error.jwt;

public class JwtNotMatchingExceptionHandler extends RuntimeException {
    public JwtNotMatchingExceptionHandler(String message) {
        super(message);
    }
}
