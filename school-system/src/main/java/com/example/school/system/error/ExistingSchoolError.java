package com.example.school.system.error;

public class ExistingSchoolError extends RuntimeException {
    public ExistingSchoolError(String message) {
        super(message);
    }

}
