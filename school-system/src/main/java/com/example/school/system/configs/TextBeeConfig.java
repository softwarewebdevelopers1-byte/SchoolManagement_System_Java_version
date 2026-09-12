package com.example.school.system.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class TextBeeConfig {
    @Bean
    public RestClient textBeeRestClient(
            @Value("${textbee.api-url}") String apiUrl) {
        return RestClient.builder()
                .baseUrl(apiUrl)
                .build();
    }
}
