package com.example.school.system.error;

public class SchoolNotFoundExceptionHandler extends RuntimeException {
    public SchoolNotFoundExceptionHandler(String message) {
        super(message);
    }

}
