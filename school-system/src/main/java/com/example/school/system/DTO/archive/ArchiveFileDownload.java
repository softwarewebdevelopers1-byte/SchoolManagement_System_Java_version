package com.example.school.system.DTO.archive;

import java.nio.file.Path;

public record ArchiveFileDownload(Path file, long size, String contentType, String fileName) {
}
