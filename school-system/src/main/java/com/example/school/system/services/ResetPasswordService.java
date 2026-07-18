package com.example.school.system.services;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.PasswordResetter;
import com.example.school.system.DTO.ResetPasswordEmailerDto;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.error.InvalidTokenExceptionHandler;
import com.example.school.system.models.ExpiryLinks;
import com.example.school.system.models.Users;
import com.example.school.system.repository.ExpiryLinksRepository;
import com.example.school.system.repository.UserRepository;
import com.example.school.system.security.PasswordHashing;
import com.example.school.system.services.email.events.ResetPasswordEvent;
import com.github.f4b6a3.uuid.UuidCreator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ResetPasswordService {
    private final ExpiryLinksRepository linkTokenRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher applicationEventPublisher;
    private final JwtCreationService jwtCreationService;
    private final PasswordHashing passwordHashing;

    @Transactional
    public SchoolApiResponse<?> emailRequest(ResetPasswordEmailerDto resetPasswordDto) {
        Users user = userRepository.findByEmail(resetPasswordDto.email()).orElseThrow();
        linkTokenRepository.deleteByUsers(user);
        String token = UuidCreator.getTimeOrdered().toString();

        linkTokenRepository.save(toToken(token, user));
        applicationEventPublisher.publishEvent(new ResetPasswordEvent(resetPasswordDto.email(), token));
        System.out.println(token);
        return SchoolApiResponse.success("Reset password request emailed");
    }

    private ExpiryLinks toToken(String token, Users user) {
        var newLink = new ExpiryLinks();
        newLink.setToken(token);
        newLink.setUsers(user);
        return newLink;
    }

    private ExpiryLinks tokenValidator(String token) {
        ExpiryLinks link = linkTokenRepository.findByTokenAndUsed(token, false)
                .orElseThrow(() -> new InvalidTokenExceptionHandler("Invalid token"));
        if (!token.equals(link.getToken())) {
            throw new InvalidTokenExceptionHandler("Invalid token");
        }
        return link;

    }

    public SchoolApiResponse<?> getToken(String token) {
        Users userFound = tokenValidator(token).getUsers();
        StringBuilder validationTken = new StringBuilder();
        validationTken.append(jwtCreationService.GenerateToken(userFound));
        return SchoolApiResponse.success(validationTken, "token validated");
    }

    public void updatePassword( PasswordResetter passwordResetter) {
        ExpiryLinks link = tokenValidator(passwordResetter.token());
        link.getUsers().setPassword(passwordHashing.PasswordEncoder().encode(passwordResetter.password()));
        link.setUsed(true);
        linkTokenRepository.save(link);
    }
}
