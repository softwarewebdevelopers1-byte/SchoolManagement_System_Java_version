package com.example.school.system.services.sms;

public record SmsSendResult(
        Status status,
        String providerMessageId,
        String providerStatus,
        String errorMessage) {

    public enum Status {
        ACCEPTED,
        REJECTED
    }

    public static SmsSendResult accepted(String messageId, String providerStatus) {
        return new SmsSendResult(Status.ACCEPTED, messageId, providerStatus, null);
    }

    public static SmsSendResult rejected(String providerStatus, String errorMessage) {
        return new SmsSendResult(Status.REJECTED, null, providerStatus, errorMessage);
    }

    public boolean isAccepted() {
        return status == Status.ACCEPTED;
    }
}
