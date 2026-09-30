package com.example.school.system.services.sms;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class TextBeeService implements SmsService {

    private final RestClient restClient;

    @Value("${textbee.api-key}")
    private String apiKey;

    @Value("${textbee.device-id}")
    private String deviceId;

    @Value("${textbee.api-url}")
    private String Url;

    public TextBeeService(@Qualifier("textBeeRestClient") RestClient restClient) {
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

        log.info("TextBee Response: {}", response);
    }

    @Override
    public List<SmsSendResult> sendBulkSms(
            Collection<com.example.school.system.services.sms.SmsMessage> messages) {
        if (messages.isEmpty()) {
            return List.of();
        }
        sendBulkSms(messages.stream()
                .map(message -> new SmsMessage(message.recipient(), message.message()))
                .toList());
        return IntStream.range(0, messages.size())
                .mapToObj(index -> SmsSendResult.accepted(null, "accepted"))
                .toList();
    }

    public void sendBulkSms(List<SmsMessage> messages) {
        if (messages.isEmpty()) {
            return;
        }
        Map<String, Object> requestBody = Map.of(
                "deviceId", deviceId,
                "messages", messages.stream()
                        .map(message -> Map.of(
                                "recipients", List.of(message.recipient()),
                                "message", message.message()))
                        .toList());

        restClient.post()
                .uri(Url + "/gateway/send-bulk-sms")
                .header("x-api-key", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .toBodilessEntity();
    }

    public record SmsMessage(String recipient, String message) {
    }
}
