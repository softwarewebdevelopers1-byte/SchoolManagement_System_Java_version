package com.example.school.system.services.timetable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.models.TimetableEntry;
import com.example.school.system.models.Timetable;
import com.example.school.system.types.TimetableConflictType;

@Service
public class ConflictDetectionService {

    /**
     * Independent final validation for generated timetables.  The solver is the
     * primary guard; this deliberately re-checks its output without relying on
     * solver state before anything is written to the database.
     */
    public List<TimetableConflict> detect(Timetable timetable, TimetableGenerationContext context) {
        var conflicts = new ArrayList<TimetableConflict>();
        if (!timetable.getSchool().getId().equals(context.school().getId())
                || !java.util.Objects.equals(timetable.getAcademicYear(), context.settings().getAcademicYear())
                || !java.util.Objects.equals(timetable.getTerm(), context.settings().getCurrentSchoolTerm())) {
            conflicts.add(TimetableConflict.error(TimetableConflictType.INVALID_SUBJECT_ASSIGNMENT,
                    "Timetable school, academic year, or term does not match the generation request.",
                    null, null, null, null, null));
        }
        var validSlots = new HashSet<String>();
        for (var slot : context.weeklySlots()) {
            validSlots.add(slot.dayOfWeek() + ":" + slot.periodNumber() + ":" + slot.startTime() + ":" + slot.endTime());
        }
        var expectedByJoint = new HashMap<UUID, Integer>();
        for (var requirement : context.requirements()) {
            expectedByJoint.merge(requirement.getSubjectJoint().getId(), requirement.getWeeklyLessons(), Integer::sum);
        }
        conflicts.addAll(detectEntries(timetable.getEntries(), expectedByJoint, validSlots, context.school().getId()));
        return conflicts;
    }

    public List<TimetableConflict> detect(List<TimetableEntry> entries, int lessonsRequired) {
        return detectEntries(entries, Map.of(), Set.of(), null, lessonsRequired);
    }

    private List<TimetableConflict> detectEntries(List<TimetableEntry> entries, Map<UUID, Integer> expectedByJoint,
            Set<String> validSlots, UUID expectedSchoolId) {
        return detectEntries(entries, expectedByJoint, validSlots, expectedSchoolId, -1);
    }

    private List<TimetableConflict> detectEntries(List<TimetableEntry> entries, Map<UUID, Integer> expectedByJoint,
            Set<String> validSlots, UUID expectedSchoolId, int legacyLessonsRequired) {
        var conflicts = new ArrayList<TimetableConflict>();
        var classSlots = new HashSet<String>();
        var teacherSlots = new HashSet<String>();
        var jointSlots = new HashSet<String>();
        var generatedBySubject = new HashMap<UUID, Integer>();

        for (var entry : entries) {
            if (entry.getTeacherProfile() == null || entry.getSubjectJoint() == null || entry.getSubject() == null
                    || entry.getSchoolClass() == null || entry.getSubjectJoint().getTeacherProfile() == null
                    || !entry.getTeacherProfile().getId().equals(entry.getSubjectJoint().getTeacherProfile().getId())) {
                conflicts.add(TimetableConflict.error(TimetableConflictType.INVALID_TEACHER_ASSIGNMENT,
                        "Timetable entry uses a teacher who is not assigned to this subject/class.",
                        entry.getSchoolClass() == null ? null : entry.getSchoolClass().getClassId(),
                        entry.getTeacherProfile() == null ? null : entry.getTeacherProfile().getId(),
                        entry.getSubject() == null ? null : entry.getSubject().getId(),
                        entry.getDayOfWeek(),
                        entry.getPeriodNumber()));
                continue;
            }
            if (!entry.getSubject().getId().equals(entry.getSubjectJoint().getSubject().getId())
                    || !entry.getSchoolClass().getClassId().equals(entry.getSubjectJoint().getSchoolClass().getClassId())) {
                conflicts.add(TimetableConflict.error(TimetableConflictType.INVALID_SUBJECT_ASSIGNMENT,
                        "Timetable entry subject/class does not match its allocation.",
                        entry.getSchoolClass().getClassId(),
                        entry.getTeacherProfile().getId(),
                        entry.getSubject().getId(),
                        entry.getDayOfWeek(),
                        entry.getPeriodNumber()));
            }
            if (expectedSchoolId != null
                    && (!expectedSchoolId.equals(entry.getSchoolClass().getSchool().getId())
                            || !expectedSchoolId.equals(entry.getSubject().getSchool().getId())
                            || !expectedSchoolId.equals(entry.getSubjectJoint().getSchoolClass().getSchool().getId()))) {
                conflicts.add(slotConflict(TimetableConflictType.INVALID_SUBJECT_ASSIGNMENT,
                        "Timetable entry belongs to a different school.", entry));
            }
            if (!validSlots.isEmpty() && !validSlots.contains(entry.getDayOfWeek() + ":" + entry.getPeriodNumber()
                    + ":" + entry.getStartTime() + ":" + entry.getEndTime())) {
                conflicts.add(slotConflict(TimetableConflictType.BREAK_VIOLATION,
                        "Timetable entry is not assigned to a generated teaching period.", entry));
            }

            var classKey = entry.getSchoolClass().getClassId() + ":" + entry.getDayOfWeek() + ":"
                    + entry.getPeriodNumber();
            var teacherKey = entry.getTeacherProfile().getId() + ":" + entry.getDayOfWeek() + ":"
                    + entry.getPeriodNumber();
            var jointKey = entry.getSubjectJoint().getId() + ":" + entry.getDayOfWeek() + ":"
                    + entry.getPeriodNumber();
            if (!classSlots.add(classKey)) {
                conflicts.add(slotConflict(TimetableConflictType.CLASS_CONFLICT, "Class has more than one lesson.",
                        entry));
            }
            if (!teacherSlots.add(teacherKey)) {
                conflicts.add(slotConflict(TimetableConflictType.TEACHER_CONFLICT, "Teacher has more than one lesson.",
                        entry));
            }
            if (!jointSlots.add(jointKey)) {
                conflicts.add(slotConflict(TimetableConflictType.DUPLICATE_ENTRY, "Duplicate timetable entry.", entry));
            }
            generatedBySubject.merge(entry.getSubjectJoint().getId(), 1, Integer::sum);
        }

        int lessonsGenerated = generatedBySubject.values().stream().mapToInt(Integer::intValue).sum();
        if (!expectedByJoint.isEmpty()) {
            for (var expected : expectedByJoint.entrySet()) {
                int actual = generatedBySubject.getOrDefault(expected.getKey(), 0);
                if (actual != expected.getValue()) {
                    conflicts.add(TimetableConflict.error(actual < expected.getValue()
                            ? TimetableConflictType.MISSING_LESSON : TimetableConflictType.EXTRA_LESSON,
                            "Subject requirement has " + actual + " scheduled lessons; " + expected.getValue()
                                    + " are required.",
                            null, null, null, null, null));
                }
            }
            for (var generated : generatedBySubject.keySet()) {
                if (!expectedByJoint.containsKey(generated)) {
                    conflicts.add(TimetableConflict.error(TimetableConflictType.EXTRA_LESSON,
                            "Timetable contains a lesson without a subject requirement.", null, null, null, null, null));
                }
            }
        } else if (lessonsGenerated > legacyLessonsRequired) {
            conflicts.add(TimetableConflict.error(TimetableConflictType.EXTRA_LESSON,
                    "Generated lessons exceed required lesson count.", null, null, null, null, null));
        } else if (lessonsGenerated < legacyLessonsRequired) {
            conflicts.add(TimetableConflict.error(TimetableConflictType.MISSING_LESSON,
                    "Generated lessons are fewer than required lesson count.", null, null, null, null, null));
        }
        return conflicts;
    }

    public Map<UUID, Integer> subjectCoverage(List<TimetableEntry> entries) {
        var coverage = new HashMap<UUID, Integer>();
        for (var entry : entries) {
            coverage.merge(entry.getSubject().getId(), 1, Integer::sum);
        }
        return coverage;
    }

    private TimetableConflict slotConflict(TimetableConflictType type, String message, TimetableEntry entry) {
        return TimetableConflict.error(type, message,
                entry.getSchoolClass().getClassId(),
                entry.getTeacherProfile().getId(),
                entry.getSubject().getId(),
                entry.getDayOfWeek(),
                entry.getPeriodNumber());
    }
}
