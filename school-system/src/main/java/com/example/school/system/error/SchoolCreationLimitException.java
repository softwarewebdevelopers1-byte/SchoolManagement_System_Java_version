package com.example.school.system.error;

public class SchoolCreationLimitException extends RuntimeException {
    public SchoolCreationLimitException(String message) {
        super(message);
    }
}
