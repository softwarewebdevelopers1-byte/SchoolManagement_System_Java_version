package com.example.school.system.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ApiRateLimitFilterTest {
    @Test
    void throttlesSuperAdminLoginByClientAddress() throws Exception {
        AtomicLong ticker = new AtomicLong();
        ApiRateLimitFilter filter = new ApiRateLimitFilter(
                new ApiRateLimitService(ticker::get));
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/superadmin/login");
        MockHttpServletResponse response = new MockHttpServletResponse();

        for (int attempt = 0; attempt < 5; attempt++) {
            response = new MockHttpServletResponse();
            filter.doFilterInternal(request, response, (req, res) -> {
            });
            assertNotEquals(429, response.getStatus());
        }

        response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, (req, res) -> {
            throw new AssertionError("Throttled request must not reach the controller");
        });

        assertEquals(429, response.getStatus());
        assertEquals("120", response.getHeader("Retry-After"));
    }

    @Test
    void throttlesPublicResultsByClientAddress() throws Exception {
        AtomicLong ticker = new AtomicLong();
        ApiRateLimitService service = new ApiRateLimitService(ticker::get);
        ApiRateLimitFilter filter = new ApiRateLimitFilter(service);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/public/results/test-token");
        request.addHeader("X-Real-IP", "192.0.2.10");
        request.setRemoteAddr("172.18.0.2");

        for (int attempt = 0; attempt < 30; attempt++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilterInternal(request, response, (req, res) -> {
            });
            assertNotEquals(429, response.getStatus());
        }

        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilterInternal(request, response, (req, res) -> {
            throw new AssertionError("Throttled request must not reach the controller");
        });

        assertEquals(429, response.getStatus());
        assertEquals("2", response.getHeader("Retry-After"));
    }
}
