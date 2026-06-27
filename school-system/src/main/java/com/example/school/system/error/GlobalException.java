package com.example.school.system.error;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

public class GlobalException {
    @ExceptionHandler(SchoolNotFoundException.class)
    public ResponseEntity<?> SchoolNotFoundError(SchoolNotFoundException schoolNotFoundException) {
        return ResponseEntity.status(404).body(schoolNotFoundException.getMessage());
    }

    @ExceptionHandler(UserExistsException.class)
    public ResponseEntity<?> UserExistsError(UserExistsException userExistsException) {
        return ResponseEntity.status(409).body(userExistsException.getMessage());
    }
}
