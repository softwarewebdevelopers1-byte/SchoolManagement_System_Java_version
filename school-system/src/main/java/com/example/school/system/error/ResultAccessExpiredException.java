package com.example.school.system.error;

public class ResultAccessExpiredException extends RuntimeException {
    public ResultAccessExpiredException() {
        super("This results link has expired");
    }
}
