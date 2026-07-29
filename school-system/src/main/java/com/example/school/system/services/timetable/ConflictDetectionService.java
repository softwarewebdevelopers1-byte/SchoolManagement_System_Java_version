package com.example.school.system.services.timetable;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.models.TimetableEntry;
import com.example.school.system.types.TimetableConflictType;

@Service
public class ConflictDetectionService {

    public List<TimetableConflict> detect(List<TimetableEntry> entries, int lessonsRequired) {
        var conflicts = new ArrayList<TimetableConflict>();
        var classSlots = new HashSet<String>();
        var teacherSlots = new HashSet<String>();
        var jointSlots = new HashSet<String>();
        var generatedBySubject = new HashMap<UUID, Integer>();

        for (var entry : entries) {
            if (entry.getTeacherProfile() == null || entry.getSubjectJoint().getTeacherProfile() == null
                    || !entry.getTeacherProfile().getId().equals(entry.getSubjectJoint().getTeacherProfile().getId())) {
                conflicts.add(TimetableConflict.error(TimetableConflictType.INVALID_TEACHER_ASSIGNMENT,
                        "Timetable entry uses a teacher who is not assigned to this subject/class.",
                        entry.getSchoolClass().getClassId(),
                        entry.getTeacherProfile() == null ? null : entry.getTeacherProfile().getId(),
                        entry.getSubject().getId(),
                        entry.getDayOfWeek(),
                        entry.getPeriodNumber()));
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
            generatedBySubject.merge(entry.getSubject().getId(), 1, Integer::sum);
        }

        int lessonsGenerated = generatedBySubject.values().stream().mapToInt(Integer::intValue).sum();
        if (lessonsGenerated > lessonsRequired) {
            conflicts.add(TimetableConflict.error(TimetableConflictType.EXTRA_LESSON,
                    "Generated lessons exceed required lesson count.", null, null, null, null, null));
        } else if (lessonsGenerated < lessonsRequired) {
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
