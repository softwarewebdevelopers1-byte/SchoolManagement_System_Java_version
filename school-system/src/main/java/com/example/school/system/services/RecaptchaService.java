package com.example.school.system.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import com.example.school.system.DTO.DTOResponse.RecaptchaDTO;
import com.example.school.system.configs.RestClientConfig;

@Service
public class RecaptchaService {
    private RestClientConfig restClientConfig;

    public RecaptchaService(RestClientConfig restClient) {
        this.restClientConfig = restClient;
    }

    @Value("${recaptcha.secret}")
    private String secret;

    public boolean validateRecaptchaToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String body = "secret=" + secret + "&response=" + token;
        try {
            var response = restClientConfig.restClient().post().uri("https://www.google.com/recaptcha/api/siteverify")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(body).retrieve()
                    .body(RecaptchaDTO.class);
            return response.isSuccess();
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

}
