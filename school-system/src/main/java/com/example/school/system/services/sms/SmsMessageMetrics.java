package com.example.school.system.services.sms;

public final class SmsMessageMetrics {
    private static final String GSM_BASIC =
            "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡"
                    + "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
    private static final String GSM_EXTENSION = "\f^{}\\[~]|€";

    private SmsMessageMetrics() {
    }

    public static Metrics measure(String message) {
        int characters = message.codePointCount(0, message.length());
        int septets = gsmSeptets(message);
        if (septets >= 0) {
            return new Metrics(characters, "GSM-7", septets, segmentCount(septets, 160, 153));
        }
        int codeUnits = message.length();
        return new Metrics(characters, "UCS-2", codeUnits, segmentCount(codeUnits, 70, 67));
    }

    private static int gsmSeptets(String message) {
        int septets = 0;
        for (int index = 0; index < message.length();) {
            int codePoint = message.codePointAt(index);
            String character = new String(Character.toChars(codePoint));
            if (character.length() != 1 || GSM_BASIC.indexOf(codePoint) < 0) {
                if (GSM_EXTENSION.indexOf(codePoint) >= 0 && character.length() == 1) {
                    septets += 2;
                } else {
                    return -1;
                }
            } else {
                septets++;
            }
            index += Character.charCount(codePoint);
        }
        return septets;
    }

    private static int segmentCount(int length, int singleSegmentLimit, int multipartSegmentLimit) {
        if (length <= singleSegmentLimit) {
            return 1;
        }
        return (length + multipartSegmentLimit - 1) / multipartSegmentLimit;
    }

    public record Metrics(int characters, String encoding, int encodedUnits, int segments) {
    }
}
