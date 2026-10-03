package com.example.school.system.services.archive;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class ArchiveStorageUnavailableException extends RuntimeException {
    public ArchiveStorageUnavailableException() {
        super("The archive document is temporarily unavailable. Please try again later.");
    }
}
