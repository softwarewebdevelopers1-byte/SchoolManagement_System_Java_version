package com.example.school.system.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.error.SchoolCreationLimitException;
import com.example.school.system.models.PublicSchoolCreationQuota;
import com.example.school.system.repository.PublicSchoolCreationQuotaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublicSchoolCreationQuotaService {
    private static final int MAX_SCHOOLS_PER_DEVICE = 2;

    private final PublicSchoolCreationQuotaRepository quotaRepository;

    @Transactional
    public void reserve(String clientAddress) {
        String address = clientAddress == null || clientAddress.isBlank() ? "unknown" : clientAddress.trim();
        String deviceKey = hash(address);
        quotaRepository.createQuotaIfAbsent(deviceKey);
        PublicSchoolCreationQuota quota = quotaRepository.findByDeviceKeyForUpdate(deviceKey)
                .orElseThrow(() -> new IllegalStateException("School creation quota could not be initialized"));

        if (quota.getSchoolsCreated() >= MAX_SCHOOLS_PER_DEVICE) {
            throw new SchoolCreationLimitException(
                    "This device has reached the maximum of two school registrations.");
        }

        quota.setSchoolsCreated(quota.getSchoolsCreated() + 1);
        quotaRepository.save(quota);
    }

    private static String hash(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder(digest.length * 2);
            for (byte b : digest) {
                result.append(Character.forDigit((b >>> 4) & 0xf, 16));
                result.append(Character.forDigit(b & 0xf, 16));
            }
            return result.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
