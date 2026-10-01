package com.example.school.system.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.function.LongSupplier;

import org.springframework.stereotype.Service;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ApiRateLimitService {
    private static final int MAX_BUCKETS = 20_000;

    private final Object bucketsLock = new Object();
    private final Map<String, TokenBucket> buckets = new LinkedHashMap<>(256, 0.75f, true);
    private final LongSupplier ticker;

    public ApiRateLimitService() {
        this(System::nanoTime);
    }

    ApiRateLimitService(LongSupplier ticker) {
        this.ticker = ticker;
    }

    public Decision consume(String scope, String subject, int capacity, Duration refillPeriod) {
        String key = digest(scope + "\u0000" + subject + "\u0000" + capacity + "\u0000" + refillPeriod.toNanos());
        long now = ticker.getAsLong();
        TokenBucket bucket;

        synchronized (bucketsLock) {
            bucket = buckets.get(key);
            if (bucket == null) {
                if (buckets.size() >= MAX_BUCKETS) {
                    Iterator<String> oldest = buckets.keySet().iterator();
                    oldest.next();
                    oldest.remove();
                }
                bucket = new TokenBucket(capacity, now);
                buckets.put(key, bucket);
            }
        }

        return bucket.take(capacity, refillPeriod.toNanos(), now);
    }

    public String clientAddress(HttpServletRequest request) {
        String forwardedAddress = request.getHeader("X-Real-IP");
        if (forwardedAddress != null) {
            forwardedAddress = forwardedAddress.trim();
            if (!forwardedAddress.isEmpty()
                    && forwardedAddress.length() <= 64
                    && forwardedAddress.indexOf(',') < 0
                    && forwardedAddress.chars().noneMatch(Character::isWhitespace)) {
                return forwardedAddress;
            }
        }

        String remoteAddress = request.getRemoteAddr();
        return remoteAddress == null || remoteAddress.isBlank() ? "unknown" : remoteAddress;
    }

    public String normalizedIdentity(String identity) {
        return identity == null ? "" : identity.trim().toLowerCase(Locale.ROOT);
    }

    private static String digest(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                result.append(Character.forDigit((b >>> 4) & 0xf, 16));
                result.append(Character.forDigit(b & 0xf, 16));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }

    public record Decision(boolean allowed, long retryAfterSeconds) {
        private static Decision allow() {
            return new Decision(true, 0);
        }

        private static Decision deny(long retryAfterSeconds) {
            return new Decision(false, Math.max(1, retryAfterSeconds));
        }
    }

    private static final class TokenBucket {
        private double tokens;
        private long lastRefillNanos;

        private TokenBucket(int capacity, long now) {
            this.tokens = capacity;
            this.lastRefillNanos = now;
        }

        private synchronized Decision take(int capacity, long refillPeriodNanos, long now) {
            long elapsed = Math.max(0, now - lastRefillNanos);
            tokens = Math.min(capacity, tokens + elapsed * (capacity / (double) refillPeriodNanos));
            lastRefillNanos = now;

            if (tokens >= 1) {
                tokens -= 1;
                return Decision.allow();
            }

            double nanosUntilToken = (1 - tokens) * refillPeriodNanos / capacity;
            return Decision.deny((long) Math.ceil(nanosUntilToken / 1_000_000_000d));
        }
    }
}
