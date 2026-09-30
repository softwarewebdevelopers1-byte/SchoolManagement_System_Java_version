package com.example.school.system.services.sms;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.jsonPath;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;

import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

class MobitechSmsServiceTest {
    private static final String API_URL = "https://mobitech.test";

    private MockRestServiceServer mockServer;
    private MobitechSmsService service;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder().baseUrl(API_URL);
        mockServer = MockRestServiceServer.bindTo(builder).build();
        service = new MobitechSmsService(
                builder.build(),
                "unit-test-api-key",
                "MOBI-TECH",
                7);
    }

    @Test
    void sendsEachBulkRecipientWithMobitechRequestShapeAndKeepsAcceptedIds() {
        expectRecipient("+254700000001", "First message");
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("h_api_key", "unit-test-api-key"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.mobile").value("+254700000002"))
                .andExpect(jsonPath("$.response_type").value("json"))
                .andExpect(jsonPath("$.sender_name").value("MOBI-TECH"))
                .andExpect(jsonPath("$.service_id").value(7))
                .andExpect(jsonPath("$.message").value("Second message"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withSuccess(
                                "{\"status_code\":1000,\"status_desc\":\"Accepted\","
                                        + "\"message_id\":\"mobitech-2\"}",
                                MediaType.APPLICATION_JSON));

        List<SmsSendResult> results = service.sendBulkSms(List.of(
                new SmsMessage("+254700000001", "First message"),
                new SmsMessage("+254700000002", "Second message")));

        assertEquals(2, results.size());
        assertTrue(results.get(0).isAccepted());
        assertEquals("mobitech-1", results.get(0).providerMessageId());
        assertEquals("1000", results.get(0).providerStatus());
        assertTrue(results.get(1).isAccepted());
        assertEquals("mobitech-2", results.get(1).providerMessageId());
        mockServer.verify();
    }

    @Test
    void reportsHttp400AsARejectedSms() {
        expectHttpFailure(HttpStatus.BAD_REQUEST);

        SmsSendResult result = service.sendBulkSms(List.of(message())).getFirst();

        assertFalse(result.isAccepted());
        assertEquals("400", result.providerStatus());
        assertEquals("Mobitech request failed (HTTP 400)", result.errorMessage());
        mockServer.verify();
    }

    @Test
    void reportsUnauthorizedResponseAndDoesNotRetryTheBatch() {
        expectHttpFailure(HttpStatus.UNAUTHORIZED);

        List<SmsSendResult> results = service.sendBulkSms(List.of(message(), message()));

        assertEquals(2, results.size());
        assertEquals("Mobitech rejected the API credentials (HTTP 401)", results.get(0).errorMessage());
        assertEquals("Not attempted after a Mobitech request failure", results.get(1).errorMessage());
        mockServer.verify();
    }

    @Test
    void reportsForbiddenResponseAsInvalidCredentials() {
        expectHttpFailure(HttpStatus.FORBIDDEN);

        SmsSendResult result = service.sendBulkSms(List.of(message())).getFirst();

        assertFalse(result.isAccepted());
        assertEquals("Mobitech rejected the API credentials (HTTP 403)", result.errorMessage());
        mockServer.verify();
    }

    @Test
    void reportsHttp500AndDoesNotTreatItAsAcceptance() {
        expectHttpFailure(HttpStatus.INTERNAL_SERVER_ERROR);

        SmsSendResult result = service.sendBulkSms(List.of(message())).getFirst();

        assertFalse(result.isAccepted());
        assertEquals("500", result.providerStatus());
        assertEquals("Mobitech request failed (HTTP 500)", result.errorMessage());
        mockServer.verify();
    }

    @Test
    void reportsTimeoutAndLeavesRemainingRecipientsUnattempted() {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(request -> {
                    throw new ResourceAccessException(
                            "Read timed out", new SocketTimeoutException("read timed out"));
                });

        List<SmsSendResult> results = service.sendBulkSms(List.of(message(), message()));

        assertEquals(2, results.size());
        assertEquals("Mobitech request timed out", results.get(0).errorMessage());
        assertEquals("Not attempted after a Mobitech request failure", results.get(1).errorMessage());
        mockServer.verify();
    }

    @Test
    void reportsConnectionFailureWithoutMakingMoreRequests() {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(request -> {
                    throw new ResourceAccessException(
                            "Connection refused", new ConnectException("connection refused"));
                });

        List<SmsSendResult> results = service.sendBulkSms(List.of(message(), message()));

        assertEquals(2, results.size());
        assertEquals("Mobitech connection failed", results.get(0).errorMessage());
        assertEquals("Not attempted after a Mobitech request failure", results.get(1).errorMessage());
        mockServer.verify();
    }

    @Test
    void rejectsProviderLevelFailuresEvenWhenHttpStatusIsSuccessful() {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withSuccess(
                                "{\"status_code\":1009,\"status_desc\":\"Unknown error\","
                                        + "\"message_id\":\"0\"}",
                                MediaType.APPLICATION_JSON));

        SmsSendResult result = service.sendBulkSms(List.of(message())).getFirst();

        assertFalse(result.isAccepted());
        assertEquals("1009", result.providerStatus());
        assertEquals("Mobitech rejected the SMS request", result.errorMessage());
        mockServer.verify();
    }

    @Test
    void stopsTheBatchWhenMobitechReportsInsufficientBalance() {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withSuccess(
                                "{\"status_code\":1009,\"status_desc\":\"Insufficient SMS balance\"}",
                                MediaType.APPLICATION_JSON));

        List<SmsSendResult> results = service.sendBulkSms(List.of(message(), message()));

        assertEquals(2, results.size());
        assertEquals("Mobitech reported insufficient SMS balance", results.get(0).errorMessage());
        assertEquals("Not attempted after a Mobitech request failure", results.get(1).errorMessage());
        mockServer.verify();
    }

    @Test
    void identifiesInsufficientBalanceFromAnHttpErrorResponse() {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST)
                        .body("{\"status_desc\":\"Insufficient SMS balance\"}"));

        SmsSendResult result = service.sendBulkSms(List.of(message())).getFirst();

        assertEquals("Mobitech reported insufficient SMS balance (HTTP 400)", result.errorMessage());
        mockServer.verify();
    }

    @Test
    void rejectsMalformedAndUnexpectedResponses() {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withSuccess("{malformed", MediaType.APPLICATION_JSON));
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withSuccess("{\"unexpected\":\"format\"}", MediaType.APPLICATION_JSON));

        SmsSendResult malformed = service.sendBulkSms(List.of(message())).getFirst();
        assertFalse(malformed.isAccepted());
        assertEquals("Mobitech returned a malformed response", malformed.errorMessage());

        SmsSendResult unexpected = service.sendBulkSms(List.of(message())).getFirst();
        assertFalse(unexpected.isAccepted());
        assertEquals("Mobitech response did not contain a status", unexpected.errorMessage());
        mockServer.verify();
    }

    private void expectRecipient(String recipient, String message) {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("h_api_key", "unit-test-api-key"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.mobile").value(recipient))
                .andExpect(jsonPath("$.response_type").value("json"))
                .andExpect(jsonPath("$.sender_name").value("MOBI-TECH"))
                .andExpect(jsonPath("$.service_id").value(7))
                .andExpect(jsonPath("$.message").value(message))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators
                        .withSuccess(
                                "{\"status_code\":1000,\"status_desc\":\"Success\","
                                        + "\"message_id\":\"mobitech-1\"}",
                                MediaType.APPLICATION_JSON));
    }

    private void expectHttpFailure(HttpStatus status) {
        mockServer.expect(requestTo(API_URL + "/sms/sendsms"))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("h_api_key", "unit-test-api-key"))
                .andRespond(withStatus(status).body("{\"error\":\"test failure\"}"));
    }

    private SmsMessage message() {
        return new SmsMessage("+254700000001", "A test message");
    }
}
