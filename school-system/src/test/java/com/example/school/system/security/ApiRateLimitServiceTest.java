package com.example.school.system.security;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.Test;

class ApiRateLimitServiceTest {
    @Test
    void deniesRequestsWhenBucketIsEmptyAndAllowsAfterRefill() {
        AtomicLong ticker = new AtomicLong();
        ApiRateLimitService service = new ApiRateLimitService(ticker::get);

        assertTrue(service.consume("login", "user", 2, Duration.ofSeconds(10)).allowed());
        assertTrue(service.consume("login", "user", 2, Duration.ofSeconds(10)).allowed());
        ApiRateLimitService.Decision rejected =
                service.consume("login", "user", 2, Duration.ofSeconds(10));
        assertFalse(rejected.allowed());
        assertTrue(rejected.retryAfterSeconds() > 0);

        ticker.set(Duration.ofSeconds(5).toNanos());
        assertTrue(service.consume("login", "user", 2, Duration.ofSeconds(10)).allowed());
    }

    @Test
    void keepsDifferentSubjectsInSeparateBuckets() {
        ApiRateLimitService service = new ApiRateLimitService();

        assertTrue(service.consume("login", "user-one", 1, Duration.ofMinutes(1)).allowed());
        assertTrue(service.consume("login", "user-two", 1, Duration.ofMinutes(1)).allowed());
    }
}
