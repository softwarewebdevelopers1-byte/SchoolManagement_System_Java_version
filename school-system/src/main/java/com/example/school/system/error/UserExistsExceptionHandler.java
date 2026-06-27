package com.example.school.system.error;

public class UserExistsExceptionHandler extends RuntimeException {
    public UserExistsExceptionHandler(String message) {
        super(message);
    }
}
