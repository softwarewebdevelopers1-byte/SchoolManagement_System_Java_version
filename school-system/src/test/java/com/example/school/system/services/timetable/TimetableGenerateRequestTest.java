package com.example.school.system.services.timetable;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import com.example.school.system.DTO.timetable.SchoolBreakRequest;
import com.example.school.system.DTO.timetable.TimetableGenerateRequest;
import com.example.school.system.types.SubjectTimePreference;
import com.example.school.system.types.SubjectType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

class TimetableGenerateRequestTest {

    @Test
    void generateRequestCarriesSchoolDaySettingsAndBreaks() {
        var schoolId = UUID.randomUUID();
        var breakRequest = new SchoolBreakRequest("Morning Break", LocalTime.of(10, 0), LocalTime.of(10, 20));

        var request = new TimetableGenerateRequest(
                schoolId,
                true,
                LocalTime.of(8, 0),
                7,
                40,
                List.of(breakRequest));

        assertEquals(schoolId, request.schoolId());
        assertEquals(Boolean.TRUE, request.replaceExisting());
        assertEquals(LocalTime.of(8, 0), request.schoolStartTime());
        assertEquals(7, request.lessonsPerDay());
        assertEquals(40, request.minutesPerLesson());
        assertNotNull(request.breaks());
        assertEquals("Morning Break", request.breaks().get(0).name());
    }

    @Test
    void legacyFrontendPayloadStillMapsToSchoolSettings() throws Exception {
        var payload = """
                {
                  "schoolId": "00000000-0000-0000-0000-000000000001",
                  "schoolStartTime": "08:00",
                  "subjectsPerDay": 7,
                  "subjectDurationMinutes": 40,
                  "breaks": [
                    { "name": "Morning Break", "startTime": "10:00", "endTime": "10:20" }
                  ]
                }
                """;

        var mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        var request = mapper.readValue(payload, TimetableGenerateRequest.class);

        assertEquals(LocalTime.of(8, 0), request.schoolStartTime());
        assertEquals(7, request.lessonsPerDay());
        assertEquals(40, request.minutesPerLesson());
        assertNotNull(request.breaks());
    }

    @Test
    void backtrackingSolverSchedulesSimpleMultiClassWeekWithoutConflicts() {
        var classOne = UUID.randomUUID();
        var classTwo = UUID.randomUUID();
        var math = UUID.randomUUID();
        var science = UUID.randomUUID();
        var teacherOne = UUID.randomUUID();
        var teacherTwo = UUID.randomUUID();
        var teacherThree = UUID.randomUUID();
        var teacherFour = UUID.randomUUID();

        var lessons = List.of(
                new LessonBlock(UUID.randomUUID(), classOne, math, teacherOne, UUID.randomUUID(), "Math",
                        SubjectType.COMPULSORY, SubjectTimePreference.MORNING, 1, 1, Set.of()),
                new LessonBlock(UUID.randomUUID(), classOne, science, teacherTwo, UUID.randomUUID(), "Science",
                        SubjectType.COMPULSORY, SubjectTimePreference.AFTERNOON, 1, 2, Set.of()),
                new LessonBlock(UUID.randomUUID(), classTwo, math, teacherThree, UUID.randomUUID(), "Math",
                        SubjectType.COMPULSORY, SubjectTimePreference.MORNING, 1, 1, Set.of()),
                new LessonBlock(UUID.randomUUID(), classTwo, science, teacherFour, UUID.randomUUID(), "Science",
                        SubjectType.COMPULSORY, SubjectTimePreference.AFTERNOON, 1, 2, Set.of()));

        var slots = new ArrayList<GeneratedSlot>();
        for (var day : List.of(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY,
                DayOfWeek.FRIDAY)) {
            for (int period = 1; period <= 6; period++) {
                slots.add(new GeneratedSlot(day, period, LocalTime.of(8, 0).plusMinutes((period - 1) * 40),
                        LocalTime.of(8, 0).plusMinutes(period * 40)));
            }
        }

        var solver = new TimetableBacktrackingSolver();
        var result = solver.solve(lessons, slots);

        assertTrue(result.success());
        assertTrue(result.conflicts().isEmpty());
        assertEquals(4, result.scheduledLessons().size());
        assertFalse(result.scheduledLessons().stream().anyMatch(item -> item.firstSlot() == null));
    }

    @Test
    void solverSeparatesLessonsThatShareATeacher() {
        var teacher = UUID.randomUUID();
        var classOne = UUID.randomUUID();
        var classTwo = UUID.randomUUID();
        var subject = UUID.randomUUID();
        var slots = List.of(
                new GeneratedSlot(DayOfWeek.MONDAY, 1, LocalTime.of(8, 0), LocalTime.of(8, 40)),
                new GeneratedSlot(DayOfWeek.MONDAY, 2, LocalTime.of(8, 40), LocalTime.of(9, 20)));
        var lessons = List.of(
                new LessonBlock(UUID.randomUUID(), classOne, subject, teacher, UUID.randomUUID(), "Math",
                        SubjectType.COMPULSORY, SubjectTimePreference.NEUTRAL, 1, 1, Set.of()),
                new LessonBlock(UUID.randomUUID(), classTwo, subject, teacher, UUID.randomUUID(), "Math",
                        SubjectType.COMPULSORY, SubjectTimePreference.NEUTRAL, 1, 1, Set.of()));

        var result = new TimetableBacktrackingSolver().solve(lessons, slots);

        assertTrue(result.success());
        assertEquals(2, result.scheduledLessons().stream().map(item -> item.firstSlot().periodNumber()).distinct().count());
    }

    @Test
    void solverFailsInsteadOfReturningAPartialTimetableWhenCapacityIsImpossible() {
        var teacher = UUID.randomUUID();
        var slots = List.of(new GeneratedSlot(DayOfWeek.MONDAY, 1, LocalTime.of(8, 0), LocalTime.of(8, 40)));
        var lessons = List.of(
                new LessonBlock(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), teacher, UUID.randomUUID(),
                        "Math", SubjectType.COMPULSORY, SubjectTimePreference.NEUTRAL, 1, 1, Set.of()),
                new LessonBlock(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), teacher, UUID.randomUUID(),
                        "English", SubjectType.COMPULSORY, SubjectTimePreference.NEUTRAL, 1, 1, Set.of()));

        var result = new TimetableBacktrackingSolver().solve(lessons, slots);

        assertFalse(result.success());
        assertTrue(result.scheduledLessons().isEmpty());
        assertEquals(0, result.lessonsGenerated());
        assertFalse(result.conflicts().isEmpty());
    }

    @Test
    void teachingPeriodsSkipConfiguredBreaks() {
        var settings = new com.example.school.system.models.SchoolSettings();
        settings.setSchoolStartTime(LocalTime.of(8, 0));
        settings.setLessonsPerDay(3);
        settings.setMinutesPerLesson(40);
        var schoolBreak = new com.example.school.system.models.SchoolBreak();
        schoolBreak.setName("break");
        schoolBreak.setStartTime(LocalTime.of(8, 40));
        schoolBreak.setEndTime(LocalTime.of(9, 0));
        settings.setBreaks(List.of(schoolBreak));

        var periods = new TeachingPeriodGenerator().generateDailyPeriods(settings);

        assertEquals(LocalTime.of(8, 0), periods.get(0).startTime());
        assertEquals(LocalTime.of(9, 0), periods.get(1).startTime());
        assertFalse(periods.stream().anyMatch(period -> period.startTime().isBefore(LocalTime.of(9, 0))
                && period.endTime().isAfter(LocalTime.of(8, 40))));
    }

    @Test
    void finalValidatorRejectsDuplicateClassTeacherAndLessonSlots() {
        var schoolClass = new com.example.school.system.models.SchoolClass();
        schoolClass.setClassId(UUID.randomUUID());
        var teacher = new com.example.school.system.models.TeacherProfile();
        teacher.setId(UUID.randomUUID());
        var subject = new com.example.school.system.models.Subject();
        subject.setId(UUID.randomUUID());
        var joint = new com.example.school.system.models.SubjectJoint();
        joint.setId(UUID.randomUUID());
        joint.setSchoolClass(schoolClass);
        joint.setSubject(subject);
        joint.setTeacherProfile(teacher);
        var first = timetableEntry(schoolClass, teacher, subject, joint);
        var duplicate = timetableEntry(schoolClass, teacher, subject, joint);

        var conflicts = new ConflictDetectionService().detect(List.of(first, duplicate), 2);

        assertTrue(conflicts.stream().anyMatch(conflict -> conflict.type().name().equals("CLASS_CONFLICT")));
        assertTrue(conflicts.stream().anyMatch(conflict -> conflict.type().name().equals("TEACHER_CONFLICT")));
        assertTrue(conflicts.stream().anyMatch(conflict -> conflict.type().name().equals("DUPLICATE_ENTRY")));
    }

    private com.example.school.system.models.TimetableEntry timetableEntry(
            com.example.school.system.models.SchoolClass schoolClass,
            com.example.school.system.models.TeacherProfile teacher,
            com.example.school.system.models.Subject subject,
            com.example.school.system.models.SubjectJoint joint) {
        var entry = new com.example.school.system.models.TimetableEntry();
        entry.setSchoolClass(schoolClass);
        entry.setTeacherProfile(teacher);
        entry.setSubject(subject);
        entry.setSubjectJoint(joint);
        entry.setDayOfWeek(DayOfWeek.MONDAY);
        entry.setPeriodNumber(1);
        entry.setStartTime(LocalTime.of(8, 0));
        entry.setEndTime(LocalTime.of(8, 40));
        return entry;
    }
}
