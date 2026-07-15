package com.example.school.system.error;

import java.util.HashSet;
import org.hibernate.exception.SQLGrammarException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mail.MailSendException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.jwt.JwtNotMatchingExceptionHandler;
import com.example.school.system.error.jwt.SchoolResourceLockedExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(SchoolResourceNotFoundExceptionHandler.class)
    public ResponseEntity<?> SchoolResourceNotFoundError(
            SchoolResourceNotFoundExceptionHandler schoolNotFoundException) {
        return ResponseEntity.status(404).body(SchoolApiResponse.error(schoolNotFoundException.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> BadRequestError(MethodArgumentNotValidException badRequesException) {
        var badRequest = new HashSet<>();
        badRequesException.getBindingResult().getFieldErrors().forEach((e) -> {
            badRequest.add(e.getDefaultMessage());
        });
        return ResponseEntity.status(400).body(SchoolApiResponse.error(badRequest.toString()));
    }

    @ExceptionHandler(SchoolResourceExistsExceptionHandler.class)
    public ResponseEntity<?> BadRequestError(SchoolResourceExistsExceptionHandler existsExceptionHandler) {
        return ResponseEntity.status(409).body(SchoolApiResponse.error(existsExceptionHandler.getMessage()));
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<?> RouteNotFound(NoResourceFoundException noResourceFoundException) {
        return ResponseEntity.status(404).body(SchoolApiResponse.error(noResourceFoundException.getMessage()));
    }

    // JWT exception handling
    @ExceptionHandler(JwtNotMatchingExceptionHandler.class)
    public ResponseEntity<?> JwtTokenNotMatchingException(
            JwtNotMatchingExceptionHandler jwtNotMatchingExceptionHandler) {
        return ResponseEntity.status(401).body(SchoolApiResponse.error(jwtNotMatchingExceptionHandler.getMessage()));
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<?> MissingRequestHeaderException() {
        return ResponseEntity.status(401).body(SchoolApiResponse.error("Unauthorized"));
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<?> httpMediaTypeNotSupportedException(
            HttpMediaTypeNotSupportedException httpMediaTypeNotSupportedException) {
        return ResponseEntity.status(415)
                .body(SchoolApiResponse.error(httpMediaTypeNotSupportedException.getMessage()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> DataIntegrityViolationException(
            DataIntegrityViolationException dataIntegrityViolationException) {
        return ResponseEntity.status(500).body(SchoolApiResponse.error(dataIntegrityViolationException.getMessage()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> HttpMessageNotReadableException(
            HttpMessageNotReadableException httpMessageNotReadableException) {
        return ResponseEntity.status(500).body(SchoolApiResponse.error("Unreadable JSON format"));
    }

    @ExceptionHandler(InvalidTokenExceptionHandler.class)
    public ResponseEntity<?> tokenExceptionHandler(
            InvalidTokenExceptionHandler tokenExceptionHandler) {
        return ResponseEntity.status(401).body(SchoolApiResponse.error(tokenExceptionHandler.getMessage()));
    }

    @ExceptionHandler(SchoolResourceLockedExceptionHandler.class)
    public ResponseEntity<?> SchoolResourceLockedExceptionHandler(
            SchoolResourceLockedExceptionHandler schoolResourceLockedExceptionHandler) {
        return ResponseEntity.status(423)
                .body(SchoolApiResponse.error(schoolResourceLockedExceptionHandler.getMessage()));
    }

    @ExceptionHandler(MailExceptionHandler.class)
    public ResponseEntity<?> MailExceptionHandler(
            MailExceptionHandler mailExceptionHandler) {
        return ResponseEntity.status(423)
                .body(SchoolApiResponse.error(mailExceptionHandler.getMessage()));
    }

    // catch database timeout error
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<?> handleTimeOut() {
        return ResponseEntity.status(503).body(SchoolApiResponse.error("something went wrong"));
    }

    // handle invalid db connection string
    @ExceptionHandler(SQLGrammarException.class)
    public ResponseEntity<?> handleDatabaseError() {
        return ResponseEntity.status(501).body(SchoolApiResponse.error("something went wrong"));
    }

    // getting all uncaught issues
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleServerError() {
        return ResponseEntity.status(501).body(SchoolApiResponse.error("something went wrong"));
    }

    @ExceptionHandler(AdminResourceException.class)
    public ResponseEntity<?> adminResources(AdminResourceException admException) {
        return ResponseEntity.status(403).body(SchoolApiResponse.error(admException.getMessage()));
    }

    // security exception
    @ExceptionHandler(AuthorizationDeniedException.class)
    public ResponseEntity<?> authorizationDeniedException() {
        return ResponseEntity.status(403).body(SchoolApiResponse.error("Forbidden"));
    }

    @ExceptionHandler(SchoolResourceRestrictedException.class)
    public ResponseEntity<?> schoolResourceRestricted(
            SchoolResourceRestrictedException schoolResourceRestrictedException) {
        return ResponseEntity.status(403).body(SchoolApiResponse.error(schoolResourceRestrictedException.getMessage()));
    }

    // email exception
    @ExceptionHandler(MailSendException.class)
    public ResponseEntity<?> MailSendException() {
        return ResponseEntity.status(500).body(SchoolApiResponse.error("unable to send email"));
    }
}
