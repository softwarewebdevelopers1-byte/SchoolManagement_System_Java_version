package com.example.school.system.DTO.stats;

import java.time.LocalDate;

public record AttendanceTrendDTO(
        LocalDate date,
        long present,
        long absent,
        double rate) {
}
