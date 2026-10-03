package com.example.school.system.DTO.archive;

public record ArchiveDownload(byte[] content, String contentType, String fileName) {
}
