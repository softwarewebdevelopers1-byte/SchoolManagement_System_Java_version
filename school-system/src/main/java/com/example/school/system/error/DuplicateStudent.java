package com.example.school.system.error;

public class DuplicateStudent extends RuntimeException {
    public DuplicateStudent(String message) {
        super(message);
    }
}
