package com.example.school.system.error;

public class SchoolExistsExceptionHandler extends RuntimeException {
    public SchoolExistsExceptionHandler(String message) {
        super(message);
    }

}
