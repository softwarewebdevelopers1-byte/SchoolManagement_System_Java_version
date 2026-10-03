package com.example.school.system.DTO.archive;

import java.time.LocalDate;
import java.util.UUID;

public record AttendanceArchivePreview(
        UUID classId,
        LocalDate startDate,
        LocalDate endDate,
        long calendarDays,
        long foundSheets,
        long duplicateSheets,
        long lockedSheets,
        long submittedSheets,
        long draftSheets,
        long missingCalendarDates,
        boolean ready) {
}
