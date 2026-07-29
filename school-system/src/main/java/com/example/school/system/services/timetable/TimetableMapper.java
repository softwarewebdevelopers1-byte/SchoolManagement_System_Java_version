package com.example.school.system.services.timetable;

import java.util.List;

import org.springframework.stereotype.Component;

import com.example.school.system.DTO.timetable.GenerationHistoryResponse;
import com.example.school.system.DTO.timetable.TimetableConflictResponse;
import com.example.school.system.DTO.timetable.TimetableEntryResponse;
import com.example.school.system.DTO.timetable.TimetableReportResponse;
import com.example.school.system.DTO.timetable.TimetableResponse;
import com.example.school.system.models.ConflictLog;
import com.example.school.system.models.GenerationHistory;
import com.example.school.system.models.Timetable;
import com.example.school.system.models.TimetableEntry;

@Component
public class TimetableMapper {

    public TimetableResponse toResponse(Timetable timetable, TimetableReportResponse report) {
        return new TimetableResponse(
                timetable.getId(),
                timetable.getSchool().getId(),
                timetable.getAcademicYear(),
                timetable.getTerm(),
                timetable.getStatus(),
                timetable.getGeneratedAt(),
                timetable.getEntries().stream().map(this::toEntryResponse).toList(),
                report);
    }

    public TimetableEntryResponse toEntryResponse(TimetableEntry entry) {
        var schoolClass = entry.getSchoolClass();
        var teacher = entry.getTeacherProfile();
        return new TimetableEntryResponse(
                entry.getId(),
                schoolClass.getClassId(),
                schoolClass.getClassGrade() + " " + schoolClass.getClassStream(),
                entry.getSubject().getId(),
                entry.getSubject().getSubjectName(),
                teacher.getId(),
                teacher.getFirstName() + " " + teacher.getLastName(),
                entry.getSubjectJoint().getId(),
                entry.getDayOfWeek(),
                entry.getPeriodNumber(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getDoubleLessonPart(),
                entry.getLocked());
    }

    public TimetableConflictResponse toConflictResponse(TimetableConflict conflict) {
        return new TimetableConflictResponse(
                conflict.type(),
                conflict.severity(),
                conflict.message(),
                conflict.classId(),
                conflict.teacherId(),
                conflict.subjectId(),
                conflict.dayOfWeek(),
                conflict.periodNumber());
    }

    public TimetableConflictResponse toConflictResponse(ConflictLog conflict) {
        return new TimetableConflictResponse(
                conflict.getType(),
                conflict.getSeverity(),
                conflict.getMessage(),
                conflict.getClassId(),
                conflict.getTeacherId(),
                conflict.getSubjectId(),
                conflict.getDayOfWeek(),
                conflict.getPeriodNumber());
    }

    public List<GenerationHistoryResponse> toHistoryResponses(List<GenerationHistory> histories) {
        return histories.stream()
                .map(history -> new GenerationHistoryResponse(
                        history.getId(),
                        history.getTimetable() == null ? null : history.getTimetable().getId(),
                        history.getStatus(),
                        history.getStartedAt(),
                        history.getFinishedAt(),
                        history.getDurationMs(),
                        history.getLessonsRequired(),
                        history.getLessonsGenerated(),
                        history.getConflictsDetected(),
                        history.getRemainingConflicts(),
                        history.getSummary()))
                .toList();
    }
}
