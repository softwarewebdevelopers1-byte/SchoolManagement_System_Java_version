package com.example.school.system.error;

public class SchoolResourceNotFoundExceptionHandler extends RuntimeException {
    public SchoolResourceNotFoundExceptionHandler(String message) {
        super(message);
    }

}
