package com.example.school.system.error.jwt;

public class SchoolResourceLockedExceptionHandler extends RuntimeException {
    public SchoolResourceLockedExceptionHandler(String message) {
        super(message);
    }
}
