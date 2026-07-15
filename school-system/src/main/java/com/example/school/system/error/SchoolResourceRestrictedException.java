package com.example.school.system.error;

public class SchoolResourceRestrictedException extends RuntimeException {
    public SchoolResourceRestrictedException(String message) {
        super(message);
    }
}
