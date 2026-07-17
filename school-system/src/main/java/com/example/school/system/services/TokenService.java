package com.example.school.system.services;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.example.school.system.error.InvalidTokenExceptionHandler;
import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.repository.ExpiryLinksRepository;

@Service
public class TokenService {
    private ExpiryLinksRepository tokenRepository;

    public TokenService(ExpiryLinksRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public void validateTokenProvided(String token) {
        String errorMessage = "Invalid token";
        if (token == null) {
            throw new InvalidTokenExceptionHandler("No token provided");
        }
        ExpiryLinks foundLink = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenExceptionHandler(errorMessage));

        if (foundLink.isUsed() || foundLink.getExpirationTime().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenExceptionHandler(errorMessage);
        }
        foundLink.setUsed(true);
        tokenRepository.save(foundLink);
    }

    public String TokenGenerator() {
        String token = UUID.randomUUID().toString();
        return token;
    }

    public void TokenSaver() {
        String token = TokenGenerator();
        ExpiryLinks link = new ExpiryLinks();
        link.setExpirationTime(LocalDateTime.now().plusDays(7));
        link.setToken(token);
        tokenRepository.save(link);
    }
}
