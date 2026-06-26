package com.example.school.system.error;

import java.util.HashSet;

import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalErrorHandler {
    @ExceptionHandler(DuplicateStudent.class)
    public ResponseEntity<?> DuplicateStudentErrorHandler(DuplicateStudent duplicateStudent) {
        return ResponseEntity.status(409).body(duplicateStudent.getMessage());
    }

    @ExceptionHandler(ExistingSchoolError.class)
    public ResponseEntity<?> NonExistingSchoolErrorHandler(ExistingSchoolError nonExistingSchool) {
        return ResponseEntity.status(404).body(nonExistingSchool.getMessage());
    }

    @ExceptionHandler(UnauthorizedUser.class)
    public ResponseEntity<?> UnauthorizedUserError(UnauthorizedUser unauthorizedUser) {
        return ResponseEntity.status(401).body(unauthorizedUser.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> BadRequestError(HttpMessageNotReadableException httpMessageNotReadableException) {
        var BadRequest = new HashSet<>();
        BadRequest.add(httpMessageNotReadableException.getLocalizedMessage());
        return ResponseEntity.status(400).body(BadRequest);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<?> BadRequestError(ConstraintViolationException constraintViolationException) {
        var error = new HashSet<>();
        constraintViolationException.getConstraintViolations().forEach(e -> {
            error.add(e.getMessage());
        });
        return ResponseEntity.status(400).body(error);
    }

}
