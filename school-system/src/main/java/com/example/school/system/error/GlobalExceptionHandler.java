package com.example.school.system.error;

import java.util.HashSet;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(SchoolResourceNotFoundExceptionHandler.class)
    public ResponseEntity<?> SchoolNotFoundError(SchoolResourceNotFoundExceptionHandler schoolNotFoundException) {
        return ResponseEntity.status(404).body(SchoolApiResponse.error(schoolNotFoundException.getMessage()));
    }

    @ExceptionHandler(UserExistsExceptionHandler.class)
    public ResponseEntity<?> UserExistsError(UserExistsExceptionHandler userExistsException) {
        return ResponseEntity.status(409).body(SchoolApiResponse.error(userExistsException.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> BadRequestError(MethodArgumentNotValidException badRequesException) {
        var badRequest = new HashSet<>();
        badRequesException.getBindingResult().getFieldErrors().forEach((e) -> {
            badRequest.add(e.getDefaultMessage());
        });
        return ResponseEntity.status(400).body(SchoolApiResponse.error(badRequest.toString()));
    }

    @ExceptionHandler(SchoolExistsExceptionHandler.class)
    public ResponseEntity<?> BadRequestError(SchoolExistsExceptionHandler existsExceptionHandler) {
        return ResponseEntity.status(409).body(SchoolApiResponse.error(existsExceptionHandler.getMessage()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
     public ResponseEntity<?> RouteNotFound(NoResourceFoundException noResourceFoundException) {
        return ResponseEntity.status(404).body(SchoolApiResponse.error(noResourceFoundException.getMessage()));
    }
}
