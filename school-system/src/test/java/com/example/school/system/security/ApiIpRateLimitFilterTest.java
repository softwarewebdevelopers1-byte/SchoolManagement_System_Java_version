package com.example.school.system.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ApiIpRateLimitFilterTest {
    @Test
    void appliesGeneralApiLimitBeforeAuthentication() throws Exception {
        AtomicLong ticker = new AtomicLong();
        ApiIpRateLimitFilter filter = new ApiIpRateLimitFilter(new ApiRateLimitService(ticker::get));
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/other");
        request.setRemoteAddr("192.0.2.15");

        for (int attempt = 0; attempt < 600; attempt++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilterInternal(request, response, (req, res) -> {
            });
            assertNotEquals(429, response.getStatus());
        }

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, (req, res) -> {
            throw new AssertionError("Throttled request must not reach authentication");
        });

        assertEquals(429, response.getStatus());
        assertEquals("1", response.getHeader("Retry-After"));
    }
}
