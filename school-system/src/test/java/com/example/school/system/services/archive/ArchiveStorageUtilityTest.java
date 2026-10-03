package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.List;

import org.junit.jupiter.api.Test;

class ArchiveStorageUtilityTest {
    @Test
    void calculatesSha256ForExactBytes() {
        assertEquals(
                "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
                ArchiveHash.sha256("abc".getBytes(StandardCharsets.UTF_8)));
    }

    @Test
    void createsPdfBytesForAnArchiveReport() {
        byte[] pdf = new ArchivePdfGenerator().generate(
                "Test archive",
                List.of(new String[] { "Student", "Total" }, new String[] { "A Student", "80" }));

        assertTrue(new String(pdf, 0, 5, StandardCharsets.US_ASCII).startsWith("%PDF-"));
        assertTrue(pdf.length > 100);
    }
}
