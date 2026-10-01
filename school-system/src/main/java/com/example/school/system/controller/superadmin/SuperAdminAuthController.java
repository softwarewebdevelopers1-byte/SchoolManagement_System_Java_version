package com.example.school.system.controller.superadmin;

import java.time.Duration;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.example.school.system.security.ApiRateLimitService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.services.superadmin.SuperAdminService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/superadmin")
public class SuperAdminAuthController {
    private final SuperAdminService superAdminService;
    private final ApiRateLimitService rateLimitService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody SuperAdminLoginDTO request) {
        var decision = rateLimitService.consume(
                "superadmin-login-account",
                rateLimitService.normalizedIdentity(request.email()),
                5,
                Duration.ofMinutes(15));
        if (!decision.allowed()) {
            return ResponseEntity.status(429)
                    .header("Retry-After", Long.toString(decision.retryAfterSeconds()))
                    .body(SchoolApiResponse.error("Too many login attempts. Please retry later."));
        }
        return ResponseEntity.ok(SchoolApiResponse.success(superAdminService.login(request.email(), request.password()),
                "Super-admin logged in"));
    }

    @GetMapping("/invites/{token}")
    public ResponseEntity<?> validateInvite(@PathVariable String token) {
        return ResponseEntity.ok(SchoolApiResponse.success(superAdminService.validateAdminInvite(token),
                "Invite is valid"));
    }

    @PostMapping("/invites/accept")
    public ResponseEntity<?> acceptInvite(@Valid @RequestBody AcceptAdminInviteRequest request) {
        superAdminService.acceptAdminInvite(request);
        return ResponseEntity.ok(SchoolApiResponse.success("Admin invite accepted"));
    }
}
