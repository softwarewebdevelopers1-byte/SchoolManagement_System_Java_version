package com.example.school.system.error;

public class NonExistingSchool extends RuntimeException {
    public NonExistingSchool(String message) {
        super(message);
    }

}
