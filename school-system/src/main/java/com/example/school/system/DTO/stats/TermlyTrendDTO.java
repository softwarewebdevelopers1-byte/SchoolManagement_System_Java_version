package com.example.school.system.DTO.stats;

public record TermlyTrendDTO(
        int term,
        double avgPercentage,
        double avgPoints,
        long studentCount) {
}
