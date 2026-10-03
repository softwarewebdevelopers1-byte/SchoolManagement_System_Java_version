package com.example.school.system.services.archive;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@ConditionalOnProperty(name = "edunex.archive.r2.enabled", havingValue = "true")
public class R2ObjectStorage {
    private final S3Client s3Client;
    private final String bucket;

    public R2ObjectStorage(
            S3Client s3Client,
            @Value("${edunex.archive.r2.bucket}") String bucket) {
        if (bucket.isBlank()) {
            throw new IllegalStateException("R2 bucket is required when R2 archival is enabled");
        }
        this.s3Client = s3Client;
        this.bucket = bucket;
    }

    public StoredObject putAndVerify(String key, byte[] content, String contentType, String sha256) {
        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(contentType)
                        .contentLength((long) content.length)
                        .metadata(Map.of("sha256", sha256))
                        .build(),
                RequestBody.fromBytes(content));

        var head = s3Client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
        String uploadedHash = head.metadata().get("sha256");
        if (head.contentLength() != content.length || !sha256.equals(uploadedHash)
                || !contentType.equals(head.contentType())) {
            throw new IllegalStateException("R2 object verification failed for key " + key);
        }
        byte[] downloaded = get(key);
        if (downloaded.length != content.length || !ArchiveHash.sha256(downloaded).equals(sha256)) {
            throw new IllegalStateException("R2 object checksum verification failed for key " + key);
        }
        return new StoredObject(key, contentType, sha256, head.contentLength());
    }

    public byte[] get(String key) {
        try (ResponseInputStream<?> stream = s3Client.getObject(
                GetObjectRequest.builder().bucket(bucket).key(key).build())) {
            return stream.readAllBytes();
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("Unable to read archived object " + key, exception);
        }
    }

    public record StoredObject(String key, String contentType, String sha256, long size) {
    }
}
