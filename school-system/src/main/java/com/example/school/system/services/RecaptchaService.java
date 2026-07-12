package com.example.school.system.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.example.school.system.DTO.DTOResponse.RecaptchaDTO;

@Service
public class RecaptchaService {
    private RestClient restClient;
    @Value("${recaptcha.secret}")
    private String secret;

    public RecaptchaService(RestClient restClient) {
        this.restClient = restClient;

    }

    public boolean validateRecaptchaToken(String token) {
        String body = "secret=" + secret + "&response=" + token;
        if (token == null || token.isBlank()) {
            return false;
        }
        try {
            var response = restClient.post().uri("https://www.google.com/recaptcha/api/siteverify")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(body).retrieve()
                    .body(RecaptchaDTO.class);
            return response.success();
        } catch (Exception e) {
            return false;
        }
    }

}
