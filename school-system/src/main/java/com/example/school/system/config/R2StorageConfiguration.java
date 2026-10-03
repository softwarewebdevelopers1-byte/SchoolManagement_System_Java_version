package com.example.school.system.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;

@Configuration
@ConditionalOnProperty(name = "edunex.archive.r2.enabled", havingValue = "true")
public class R2StorageConfiguration {
    @Bean(destroyMethod = "close")
    S3Client r2S3Client(
            @Value("${edunex.archive.r2.endpoint}") String endpoint,
            @Value("${edunex.archive.r2.region:auto}") String region,
            @Value("${edunex.archive.r2.access-key}") String accessKey,
            @Value("${edunex.archive.r2.secret-key}") String secretKey) {
        if (endpoint.isBlank() || accessKey.isBlank() || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "R2 endpoint, access key, and secret key are required when R2 archival is enabled");
        }
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build();
    }
}
