package com.example.school.system.error;

public class InvalidTokenExceptionHandler extends RuntimeException {
    public InvalidTokenExceptionHandler(String message) {
        super(message);
    }
}
