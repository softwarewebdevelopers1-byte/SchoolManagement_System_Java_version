package com.example.school.system.services.timetable;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.school.system.models.ConflictLog;
import com.example.school.system.models.GenerationHistory;
import com.example.school.system.models.Timetable;
import com.example.school.system.models.TimetableEntry;
import com.example.school.system.types.GenerationStatus;
import com.example.school.system.types.TimetableStatus;

@Service
public class TimetablePersistenceService {

    public Timetable buildTimetable(TimetableGenerationContext context, TimetableGenerationResult result) {
        var timetable = new Timetable();
        timetable.setSchool(context.school());
        timetable.setAcademicYear(context.settings().getAcademicYear());
        timetable.setTerm(context.settings().getCurrentSchoolTerm());
        timetable.setStatus(result.success() ? TimetableStatus.ACTIVE : TimetableStatus.FAILED);
        timetable.setGenerationDurationMs(result.durationMs());
        timetable.setCompletenessPercentage(result.completenessPercentage());

        var entries = new ArrayList<TimetableEntry>();
        for (var scheduled : result.scheduledLessons()) {
            var block = scheduled.lessonBlock();
            for (int offset = 0; offset < block.length(); offset++) {
                var slot = context.slot(scheduled.firstSlot().dayOfWeek(),
                        scheduled.firstSlot().periodNumber() + offset);
                var joint = context.subjectJoint(block.subjectJointId());
                var entry = new TimetableEntry();
                entry.setTimetable(timetable);
                entry.setSchoolClass(joint.getSchoolClass());
                entry.setSubject(joint.getSubject());
                entry.setTeacherProfile(joint.getTeacherProfile());
                entry.setSubjectJoint(joint);
                entry.setDayOfWeek(slot.dayOfWeek());
                entry.setPeriodNumber(slot.periodNumber());
                entry.setStartTime(slot.startTime());
                entry.setEndTime(slot.endTime());
                entry.setDoubleLessonPart(block.length() == 1 ? 0 : offset + 1);
                entries.add(entry);
            }
        }
        timetable.getEntries().addAll(entries);
        return timetable;
    }

    public GenerationHistory buildHistory(
            TimetableGenerationContext context,
            Timetable timetable,
            TimetableGenerationResult result,
            List<TimetableConflict> conflicts,
            int conflictsResolved,
            GenerationStatus status) {
        var history = new GenerationHistory();
        history.setSchool(context.school());
        history.setTimetable(timetable);
        history.setStatus(status);
        history.setStartedAt(Instant.now().minusMillis(result.durationMs()));
        history.setFinishedAt(Instant.now());
        history.setDurationMs(result.durationMs());
        history.setLessonsRequired(result.lessonsRequired());
        history.setLessonsGenerated(result.lessonsGenerated());
        history.setConflictsDetected(conflicts.size() + conflictsResolved);
        history.setConflictsResolved(conflictsResolved);
        history.setRemainingConflicts(conflicts.size());
        history.setSummary(result.success() && conflicts.isEmpty()
                ? "Timetable generated successfully with no remaining conflicts."
                : "Timetable generation completed with remaining conflicts.");
        history.getConflictLogs().addAll(toConflictLogs(history, conflicts));
        return history;
    }

    private List<ConflictLog> toConflictLogs(GenerationHistory history, List<TimetableConflict> conflicts) {
        return conflicts.stream().map(conflict -> {
            var log = new ConflictLog();
            log.setGenerationHistory(history);
            log.setType(conflict.type());
            log.setSeverity(conflict.severity());
            log.setMessage(conflict.message());
            log.setClassId(conflict.classId());
            log.setTeacherId(conflict.teacherId());
            log.setSubjectId(conflict.subjectId());
            log.setDayOfWeek(conflict.dayOfWeek());
            log.setPeriodNumber(conflict.periodNumber());
            return log;
        }).toList();
    }
}
