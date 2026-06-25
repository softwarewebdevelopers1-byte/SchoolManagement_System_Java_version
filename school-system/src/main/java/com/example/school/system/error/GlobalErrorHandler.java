package com.example.school.system.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

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

}
