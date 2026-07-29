package com.example.school.system.services.timetable;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.school.system.models.SchoolBreak;
import com.example.school.system.models.SchoolSettings;

@Service
public class TeachingPeriodGenerator {

    public List<GeneratedSlot> generateWeeklySlots(SchoolSettings settings) {
        var periods = generateDailyPeriods(settings);
        var slots = new ArrayList<GeneratedSlot>(periods.size() * 5);
        for (var day : List.of(java.time.DayOfWeek.MONDAY, java.time.DayOfWeek.TUESDAY, java.time.DayOfWeek.WEDNESDAY,
                java.time.DayOfWeek.THURSDAY, java.time.DayOfWeek.FRIDAY)) {
            for (var period : periods) {
                slots.add(new GeneratedSlot(day, period.periodNumber(), period.startTime(), period.endTime()));
            }
        }
        return slots;
    }

    public List<DailyPeriod> generateDailyPeriods(SchoolSettings settings) {
        if (settings.getSchoolStartTime() == null || settings.getLessonsPerDay() == null
                || settings.getMinutesPerLesson() == null) {
            throw new IllegalArgumentException("School timetable settings are incomplete");
        }
        var breaks = settings.getBreaks() == null ? List.<SchoolBreak>of()
                : settings.getBreaks().stream()
                        .sorted(Comparator.comparing(SchoolBreak::getStartTime))
                        .toList();

        var periods = new ArrayList<DailyPeriod>();
        var cursor = settings.getSchoolStartTime();
        for (int periodNumber = 1; periodNumber <= settings.getLessonsPerDay(); periodNumber++) {
            cursor = movePastBreaks(cursor, breaks);
            var end = cursor.plusMinutes(settings.getMinutesPerLesson());
            while (overlapsAnyBreak(cursor, end, breaks)) {
                cursor = movePastBreaks(cursor, breaks);
                end = cursor.plusMinutes(settings.getMinutesPerLesson());
            }
            periods.add(new DailyPeriod(periodNumber, cursor, end));
            cursor = end;
        }
        return periods;
    }

    private LocalTime movePastBreaks(LocalTime cursor, List<SchoolBreak> breaks) {
        var moved = cursor;
        boolean changed;
        do {
            changed = false;
            for (var schoolBreak : breaks) {
                if (!moved.isBefore(schoolBreak.getStartTime()) && moved.isBefore(schoolBreak.getEndTime())) {
                    moved = schoolBreak.getEndTime();
                    changed = true;
                }
            }
        } while (changed);
        return moved;
    }

    private boolean overlapsAnyBreak(LocalTime start, LocalTime end, List<SchoolBreak> breaks) {
        return breaks.stream().anyMatch(schoolBreak -> start.isBefore(schoolBreak.getEndTime())
                && end.isAfter(schoolBreak.getStartTime()));
    }

    public record DailyPeriod(Integer periodNumber, LocalTime startTime, LocalTime endTime) {
    }
}
