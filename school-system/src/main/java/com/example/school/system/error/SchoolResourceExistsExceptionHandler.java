package com.example.school.system.error;

public class SchoolResourceExistsExceptionHandler extends RuntimeException {
    public SchoolResourceExistsExceptionHandler(String message) {
        super(message);
    }

}
