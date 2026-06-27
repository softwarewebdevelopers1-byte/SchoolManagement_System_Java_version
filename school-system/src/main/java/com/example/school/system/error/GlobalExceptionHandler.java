package com.example.school.system.error;

import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(SchoolNotFoundExceptionHandler.class)
    public ResponseEntity<?> SchoolNotFoundError(SchoolNotFoundExceptionHandler schoolNotFoundException) {
        return ResponseEntity.status(404).body(schoolNotFoundException.getMessage());
    }

    @ExceptionHandler(UserExistsExceptionHandler.class)
    public ResponseEntity<?> UserExistsError(UserExistsExceptionHandler userExistsException) {
        return ResponseEntity.status(409).body(userExistsException.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> BadRequestError(MethodArgumentNotValidException badRequesException) {
        var badRequest = new HashMap<>();
        badRequesException.getBindingResult().getFieldErrors().forEach((e) -> {
            badRequest.put(e.getField(), e.getDefaultMessage());
        });
        return ResponseEntity.status(400).body(badRequest);
    }

    @ExceptionHandler(SchoolExistsExceptionHandler.class)
    public ResponseEntity<?> BadRequestError(SchoolExistsExceptionHandler existsExceptionHandler) {
        return ResponseEntity.status(409).body(existsExceptionHandler.getMessage());
    }
}
