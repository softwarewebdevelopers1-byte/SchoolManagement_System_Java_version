package com.example.school.system.services;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;
import com.example.school.system.error.InvalidTokenExceptionHandler;
import com.example.school.system.models.InviteLinks;
import com.example.school.system.repository.TokenRepository;

@Service
public class TokenService {
    private TokenRepository tokenRepository;

    public TokenService(TokenRepository tokenRepository) {
        this.tokenRepository = tokenRepository;
    }

    public void validateTokenProvided(String token) {
        String errorMessage = "Invalid token";
        if (token == null) {
            throw new InvalidTokenExceptionHandler("No token provided");
        }
        InviteLinks foundLink = tokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenExceptionHandler(errorMessage));

        if (foundLink.isUsed() || foundLink.getExpirationTime().isBefore(LocalDateTime.now().minusDays(7))) {
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
        InviteLinks link = new InviteLinks();
        link.setExpirationTime(LocalDateTime.now().plusDays(7));
        link.setToken(token);
        tokenRepository.save(link);
    }
}
