package com.example.school.system.services.sms;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.http.HttpTimeoutException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import lombok.extern.slf4j.Slf4j;

@Service
@Primary
@Slf4j
public class MobitechSmsService implements SmsService {
    private static final String SMS_PATH = "/sms/sendsms";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final RestClient restClient;
    private final String apiKey;
    private final String senderName;
    private final int serviceId;

    public MobitechSmsService(
            @Qualifier("mobitechRestClient") RestClient restClient,
            @Value("${mobitech.api-key}") String apiKey,
            @Value("${mobitech.sender-name}") String senderName,
            @Value("${mobitech.service-id}") int serviceId) {
        this.restClient = restClient;
        this.apiKey = apiKey;
        this.senderName = senderName;
        this.serviceId = serviceId;
    }

    @Override
    public List<SmsSendResult> sendBulkSms(Collection<SmsMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return List.of();
        }

        List<SmsMessage> batch = List.copyOf(messages);
        List<SmsSendResult> results = new ArrayList<>(batch.size());
        int accepted = 0;
        log.info("Starting Mobitech bulk SMS request; recipients={}", batch.size());

        for (int index = 0; index < batch.size(); index++) {
            SmsMessage message = batch.get(index);
            try {
                String body = restClient.post()
                        .uri(SMS_PATH)
                        .header("h_api_key", apiKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(new MobitechRequest(
                                message.recipient(), "json", senderName, serviceId, message.message()))
                        .retrieve()
                        .body(String.class);

                SmsSendResult result = parseResponse(body);
                results.add(result);
                if (result.isAccepted()) {
                    accepted++;
                } else {
                    log.warn("Mobitech rejected SMS request {}/{}", index + 1, batch.size());
                    if (isGlobalRejection(result.providerStatus())
                            || isGlobalRejection(result.errorMessage())) {
                        addNotAttemptedResults(results, batch.size() - index - 1);
                        break;
                    }
                }
            } catch (RestClientResponseException exception) {
                String error = httpError(
                        exception.getStatusCode().value(), exception.getResponseBodyAsString());
                results.add(SmsSendResult.rejected(
                        Integer.toString(exception.getStatusCode().value()), error));
                log.warn("Mobitech SMS request {}/{} failed; httpStatus={}",
                        index + 1, batch.size(), exception.getStatusCode().value());
                if (exception.getStatusCode().is5xxServerError()
                        || exception.getStatusCode().value() == 401
                        || exception.getStatusCode().value() == 403
                        || exception.getStatusCode().value() == 402
                        || exception.getStatusCode().value() == 429
                        || isGlobalRejection(error)) {
                    addNotAttemptedResults(results, batch.size() - index - 1);
                    break;
                }
            } catch (ResourceAccessException exception) {
                String error = connectionError(exception);
                results.add(SmsSendResult.rejected(null, error));
                log.warn("Mobitech SMS request {}/{} failed; {}", index + 1, batch.size(), error);
                addNotAttemptedResults(results, batch.size() - index - 1);
                break;
            } catch (InvalidMobitechResponseException exception) {
                results.add(SmsSendResult.rejected(null, exception.getMessage()));
                log.warn("Mobitech returned an invalid response for request {}/{}",
                        index + 1, batch.size());
                addNotAttemptedResults(results, batch.size() - index - 1);
                break;
            }
        }

        log.info("Mobitech bulk SMS request completed; recipients={}, accepted={}, rejected={}",
                batch.size(), accepted, batch.size() - accepted);
        return List.copyOf(results);
    }

    private SmsSendResult parseResponse(String body) {
        if (body == null || body.isBlank()) {
            throw new InvalidMobitechResponseException("Mobitech returned an empty response");
        }

        final JsonNode response;
        try {
            response = OBJECT_MAPPER.readTree(body);
        } catch (JsonProcessingException exception) {
            throw new InvalidMobitechResponseException("Mobitech returned a malformed response");
        }
        if (response == null || !response.isObject()) {
            throw new InvalidMobitechResponseException("Mobitech returned an unexpected response format");
        }

        String statusCode = textValue(response.get("status_code"));
        String statusDescription = textValue(response.get("status_desc"));
        String messageId = textValue(response.get("message_id"));
        if (statusCode == null && statusDescription == null) {
            throw new InvalidMobitechResponseException("Mobitech response did not contain a status");
        }

        if ("1000".equals(statusCode)
                || statusCode == null && isPositiveStatusDescription(statusDescription)) {
            return SmsSendResult.accepted(messageId, statusCode == null ? statusDescription : statusCode);
        }
        return SmsSendResult.rejected(
                statusCode == null ? statusDescription : statusCode,
                rejectionMessage(statusDescription));
    }

    private String textValue(JsonNode value) {
        if (value == null || value.isNull()) {
            return null;
        }
        String text = value.asText().trim();
        return text.isEmpty() ? null : text;
    }

    private boolean isGlobalRejection(String status) {
        if (status == null) {
            return false;
        }
        String normalized = status.toLowerCase(Locale.ROOT);
        return normalized.contains("balance")
                || normalized.contains("credit")
                || normalized.contains("credential")
                || normalized.contains("authentication")
                || normalized.contains("invalid api");
    }

    private String rejectionMessage(String description) {
        if (description != null) {
            String normalized = description.toLowerCase(Locale.ROOT);
            if (normalized.contains("balance") || normalized.contains("credit")) {
                return "Mobitech reported insufficient SMS balance";
            }
            if (normalized.contains("credential")
                    || normalized.contains("authentication")
                    || normalized.contains("invalid api")) {
                return "Mobitech rejected the API credentials";
            }
        }
        return "Mobitech rejected the SMS request";
    }

    private boolean isPositiveStatusDescription(String description) {
        if (description == null) {
            return false;
        }
        String normalized = description.toLowerCase(Locale.ROOT);
        return !normalized.contains("unsuccess")
                && !normalized.contains("not success")
                && !normalized.contains("fail")
                && (normalized.contains("success")
                        || normalized.contains("accepted")
                        || normalized.contains("queued")
                        || normalized.contains("submitted"));
    }

    private String httpError(int status, String responseBody) {
        if (status == 401 || status == 403) {
            return "Mobitech rejected the API credentials (HTTP " + status + ")";
        }
        if (status == 402) {
            return "Mobitech reported insufficient SMS balance (HTTP 402)";
        }
        String description = responseDescription(responseBody);
        if (description != null) {
            String rejectedAs = rejectionMessage(description);
            if (!"Mobitech rejected the SMS request".equals(rejectedAs)) {
                return rejectedAs + " (HTTP " + status + ")";
            }
        }
        return "Mobitech request failed (HTTP " + status + ")";
    }

    private String responseDescription(String body) {
        if (body == null || body.isBlank()) {
            return null;
        }
        try {
            JsonNode response = OBJECT_MAPPER.readTree(body);
            if (response == null || !response.isObject()) {
                return null;
            }
            String description = textValue(response.get("status_desc"));
            if (description == null) {
                description = textValue(response.get("message"));
            }
            return description;
        } catch (JsonProcessingException exception) {
            return null;
        }
    }

    private String connectionError(ResourceAccessException exception) {
        if (hasCause(exception, SocketTimeoutException.class)
                || hasCause(exception, HttpTimeoutException.class)) {
            return "Mobitech request timed out";
        }
        if (hasCause(exception, ConnectException.class)) {
            return "Mobitech connection failed";
        }
        return "Mobitech connection or request failed";
    }

    private boolean hasCause(Throwable throwable, Class<? extends Throwable> causeType) {
        for (Throwable cause = throwable; cause != null; cause = cause.getCause()) {
            if (causeType.isInstance(cause)) {
                return true;
            }
        }
        return false;
    }

    private void addNotAttemptedResults(List<SmsSendResult> results, int count) {
        for (int index = 0; index < count; index++) {
            results.add(SmsSendResult.rejected(null, "Not attempted after a Mobitech request failure"));
        }
    }

    private record MobitechRequest(
            String mobile,
            String response_type,
            String sender_name,
            int service_id,
            String message) {
    }

    private static final class InvalidMobitechResponseException extends RuntimeException {
        private InvalidMobitechResponseException(String message) {
            super(message);
        }
    }
}
