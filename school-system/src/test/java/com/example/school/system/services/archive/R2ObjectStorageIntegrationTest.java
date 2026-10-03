package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

class R2ObjectStorageIntegrationTest {
    @Test
    void putsHeadsGetsAndDeletesTestObjectWhenR2TestCredentialsAreConfigured() {
        String endpoint = System.getenv("EDUNEX_ARCHIVE_R2_INTEGRATION_ENDPOINT");
        String region = System.getenv("EDUNEX_ARCHIVE_R2_INTEGRATION_REGION");
        String bucket = System.getenv("EDUNEX_ARCHIVE_R2_INTEGRATION_BUCKET");
        String accessKey = System.getenv("EDUNEX_ARCHIVE_R2_INTEGRATION_ACCESS_KEY");
        String secretKey = System.getenv("EDUNEX_ARCHIVE_R2_INTEGRATION_SECRET_KEY");
        Assumptions.assumeTrue(
                present(endpoint) && present(region) && present(bucket)
                        && present(accessKey) && present(secretKey),
                "Dedicated R2 integration-test credentials are not configured");

        try (S3Client client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
                .build()) {
            String key = "integration-tests/" + UUID.randomUUID() + ".txt";
            byte[] content = "edunex-r2-integration".getBytes(StandardCharsets.UTF_8);
            String sha256 = ArchiveHash.sha256(content);
            R2ObjectStorage storage = new R2ObjectStorage(client, bucket);
            try {
                storage.putAndVerify(key, content, "text/plain", sha256);
                var head = client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
                assertEquals(content.length, head.contentLength());
                assertEquals(sha256, head.metadata().get("sha256"));
                assertEquals("text/plain", head.contentType());
                byte[] downloaded = storage.get(key);
                assertArrayEquals(content, downloaded);
                assertEquals(sha256, ArchiveHash.sha256(downloaded));
                client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
                S3Exception missing = org.junit.jupiter.api.Assertions.assertThrows(
                        S3Exception.class,
                        () -> client.headObject(
                                HeadObjectRequest.builder().bucket(bucket).key(key).build()));
                assertEquals(404, missing.statusCode());
            } finally {
                client.deleteObject(DeleteObjectRequest.builder().bucket(bucket).key(key).build());
            }
        }
    }

    private boolean present(String value) {
        return value != null && !value.isBlank();
    }
}
