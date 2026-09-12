package com.example.school.system.services.sms;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TextBeeService {

    private final RestClient restClient;

    @Value("${textbee.api-key}")
    private String apiKey;

    @Value("${textbee.device-id}")
    private String deviceId;

    @Value("${textbee.api-url}")
    private String Url;

    public TextBeeService(RestClient restClient) {
        this.restClient = restClient;
    }

    public void sendBulkSms() {
        Map<String, Object> requestBody = Map.of(
                "deviceId", deviceId,
                "messages", List.of(
                        Map.of(
                                "recipients", List.of("+254757475316"),
                                "message", "Hi Alice"),
                        Map.of(
                                "recipients", List.of("+254746075902"),
                                "message", "Hi Bob")));

        String response = restClient.post()
                .uri(Url + "/gateway/send-bulk-sms")
                .header("x-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        System.out.println(response);
    }
}
