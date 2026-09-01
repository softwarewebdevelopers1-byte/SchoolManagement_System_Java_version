package com.example.school.system.services.timetable;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.DTO.timetable.GenerationHistoryResponse;
import com.example.school.system.DTO.timetable.SchoolTimetableSettingsRequest;
import com.example.school.system.DTO.timetable.SubjectRequirementRequest;
import com.example.school.system.DTO.timetable.TimetableConflictResponse;
import com.example.school.system.DTO.timetable.TimetableEntryResponse;
import com.example.school.system.DTO.timetable.TimetableGenerateRequest;
import com.example.school.system.DTO.timetable.TimetableReportResponse;
import com.example.school.system.DTO.timetable.TimetableResponse;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.SchoolBreak;
import com.example.school.system.models.SubjectRequirement;
import com.example.school.system.models.TeachingPeriod;
import com.example.school.system.models.Timetable;
import com.example.school.system.repository.ConflictLogRepository;
import com.example.school.system.repository.GenerationHistoryRepository;
import com.example.school.system.repository.SchoolRepository;
import com.example.school.system.repository.SchoolSettingsRepository;
import com.example.school.system.repository.StudentSubjectSelectionRepo;
import com.example.school.system.repository.SubjectJointRepo;
import com.example.school.system.repository.SubjectRequirementRepository;
import com.example.school.system.repository.TeachingPeriodRepository;
import com.example.school.system.repository.TimetableRepository;
import com.example.school.system.types.GenerationStatus;
import com.example.school.system.types.SubjectTimePreference;
import com.example.school.system.types.SubjectType;
import com.example.school.system.types.TimetableStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TimetableGenerationService {
    private final SchoolRepository schoolRepository;
    private final SchoolSettingsRepository schoolSettingsRepository;
    private final SubjectJointRepo subjectJointRepo;
    private final StudentSubjectSelectionRepo studentSubjectSelectionRepo;
    private final SubjectRequirementRepository subjectRequirementRepository;
    private final TeachingPeriodRepository teachingPeriodRepository;
    private final TimetableRepository timetableRepository;
    private final GenerationHistoryRepository generationHistoryRepository;
    private final ConflictLogRepository conflictLogRepository;
    private final TeachingPeriodGenerator teachingPeriodGenerator;
    private final TimetableBacktrackingSolver solver;
    private final ConflictDetectionService conflictDetectionService;
    private final ConflictResolutionService conflictResolutionService;
    private final TimetablePersistenceService persistenceService;
    private final TimetableMapper mapper;

    @Transactional
    public void configureSettings(SchoolTimetableSettingsRequest request) {
        var school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        var settings = schoolSettingsRepository.findBySchoolId(request.schoolId()).orElseGet(() -> {
            var created = new com.example.school.system.models.SchoolSettings();
            created.setSchool(school);
            return created;
        });
        settings.setSchoolStartTime(request.schoolStartTime());
        settings.setLessonsPerDay(request.lessonsPerDay());
        settings.setMinutesPerLesson(request.minutesPerLesson());
        if (settings.getBreaks() == null) {
            settings.setBreaks(new ArrayList<>());
        }
        settings.getBreaks().clear();
        if (request.breaks() != null) {
            request.breaks().stream()
                    .sorted(Comparator.comparing(breakRequest -> breakRequest.startTime()))
                    .forEach(breakRequest -> {
                        if (!breakRequest.startTime().isBefore(breakRequest.endTime())) {
                            throw new SchoolResourceBadInputExceptionHandler("break start time must be before end time");
                        }
                        var schoolBreak = new SchoolBreak();
                        schoolBreak.setName(breakRequest.name());
                        schoolBreak.setStartTime(breakRequest.startTime());
                        schoolBreak.setEndTime(breakRequest.endTime());
                        schoolBreak.setSchoolSettings(settings);
                        settings.getBreaks().add(schoolBreak);
                    });
        }
        schoolSettingsRepository.save(settings);
        persistTeachingPeriods(settings);
    }

    @Transactional
    public void upsertSubjectRequirement(SubjectRequirementRequest request) {
        var school = schoolRepository.findById(request.schoolId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        var joint = subjectJointRepo.findByIdAndSchoolClassClassId(request.subjectJointId(), request.classId())
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("subject allocation not found"));
        if (!joint.getSchoolClass().getSchool().getId().equals(request.schoolId())) {
            throw new SchoolResourceBadInputExceptionHandler("subject allocation does not belong to the school");
        }
        var requirement = subjectRequirementRepository
                .findBySchoolIdAndSchoolClassClassIdAndSubjectJointId(
                        request.schoolId(),
                        request.classId(),
                        request.subjectJointId())
                .orElseGet(SubjectRequirement::new);
        requirement.setSchool(school);
        requirement.setSchoolClass(joint.getSchoolClass());
        requirement.setSubjectJoint(joint);
        requirement.setWeeklyLessons(request.weeklyLessons());
        requirement.setRequiresDoubleLesson(Boolean.TRUE.equals(request.requiresDoubleLesson()));
        requirement.setTimePreference(request.timePreference() == null ? SubjectTimePreference.NEUTRAL
                : request.timePreference());
        subjectRequirementRepository.save(requirement);
    }

    @Transactional
    public TimetableResponse generate(TimetableGenerateRequest request) {
        if (hasRequestDaySettings(request)) {
            configureSettings(new SchoolTimetableSettingsRequest(
                    request.schoolId(),
                    request.schoolStartTime(),
                    request.lessonsPerDay(),
                    request.minutesPerLesson(),
                    request.breaks()));
        }
        return generate(request.schoolId(), Boolean.TRUE.equals(request.replaceExisting()));
    }

    @Transactional
    public TimetableResponse generate(UUID schoolId, boolean replaceExisting) {
        var context = loadContext(schoolId);
        if (replaceExisting) {
            timetableRepository.deleteBySchoolIdAndAcademicYearAndTerm(
                    schoolId,
                    context.settings().getAcademicYear(),
                    context.settings().getCurrentSchoolTerm());
        }
        var result = solver.solve(buildLessonBlocks(context), context.weeklySlots());
        var timetable = persistenceService.buildTimetable(context, result);
        var conflicts = new ArrayList<>(result.conflicts());
        if (result.success()) {
            conflicts.addAll(conflictDetectionService.detect(timetable.getEntries(), result.lessonsRequired()));
        }
        int repaired = conflictResolutionService.attemptRepair(conflicts);
        var savedTimetable = result.success() && conflicts.isEmpty() ? timetableRepository.save(timetable) : null;
        var status = result.success() && conflicts.isEmpty() ? GenerationStatus.SUCCESS : GenerationStatus.FAILED;
        var history = persistenceService.buildHistory(context, savedTimetable, result, conflicts, repaired, status);
        generationHistoryRepository.save(history);
        var report = report(result, conflicts, repaired);
        return mapper.toResponse(savedTimetable == null ? timetable : savedTimetable, report);
    }

    private boolean hasRequestDaySettings(TimetableGenerateRequest request) {
        return request.schoolStartTime() != null
                || request.lessonsPerDay() != null
                || request.minutesPerLesson() != null
                || request.breaks() != null;
    }

    @Transactional(readOnly = true)
    public TimetableResponse preview(UUID schoolId) {
        var context = loadContext(schoolId);
        var result = solver.solve(buildLessonBlocks(context), context.weeklySlots());
        var timetable = persistenceService.buildTimetable(context, result);
        var conflicts = new ArrayList<>(result.conflicts());
        if (result.success()) {
            conflicts.addAll(conflictDetectionService.detect(timetable.getEntries(), result.lessonsRequired()));
        }
        return mapper.toResponse(timetable, report(result, conflicts, 0));
    }

    @Transactional(readOnly = true)
    public TimetableResponse getActiveTimetable(UUID schoolId) {
        var settings = schoolSettingsRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));
        var timetable = timetableRepository.findFirstBySchoolIdAndAcademicYearAndTermAndStatusOrderByGeneratedAtDesc(
                schoolId,
                settings.getAcademicYear(),
                settings.getCurrentSchoolTerm(),
                TimetableStatus.ACTIVE)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("active timetable not found"));
        var report = reportFromEntries(timetable);
        return mapper.toResponse(timetable, report);
    }

    @Transactional(readOnly = true)
    public TimetableReportResponse validateActiveTimetable(UUID schoolId) {
        var response = getActiveTimetable(schoolId);
        return response.report();
    }

    @Transactional
    public void deleteTermTimetable(UUID schoolId) {
        var settings = schoolSettingsRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school settings not found"));
        timetableRepository.deleteBySchoolIdAndAcademicYearAndTerm(
                schoolId,
                settings.getAcademicYear(),
                settings.getCurrentSchoolTerm());
    }

    @Transactional(readOnly = true)
    public List<GenerationHistoryResponse> history(UUID schoolId) {
        return mapper.toHistoryResponses(generationHistoryRepository.findAllBySchoolIdOrderByStartedAtDesc(schoolId));
    }

    @Transactional(readOnly = true)
    public List<TimetableConflictResponse> conflictReport(UUID generationHistoryId) {
        return conflictLogRepository.findAllByGenerationHistoryId(generationHistoryId).stream()
                .map(mapper::toConflictResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> getTeacherTimetable(String authHeader, String view) {
        // Returns timetable entries filtered for the current teacher
        var allTimetables = timetableRepository.findAllByStatus(TimetableStatus.ACTIVE);
        return allTimetables.stream()
                .flatMap(t -> t.getEntries().stream())
                .map(mapper::toEntryResponse)
                .toList();
    }

    @Transactional
    public void deleteTimetableEntry(UUID id) {
        timetableRepository.findById(id)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("timetable entry not found"));
        timetableRepository.deleteById(id);
    }

    private TimetableGenerationContext loadContext(UUID schoolId) {
        var school = schoolRepository.findById(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school not found"));
        var settings = schoolSettingsRepository.findBySchoolId(schoolId)
                .orElseThrow(() -> new SchoolResourceNotFoundExceptionHandler("school timetable settings not found"));
        if (settings.getBreaks() != null) {
            settings.getBreaks().size();
        }
        var requirements = subjectRequirementRepository.findAllBySchoolId(schoolId);
        if (requirements.isEmpty()) {
            throw new SchoolResourceBadInputExceptionHandler("no subject weekly requirements configured");
        }
        var joints = subjectJointRepo.findAllBySchoolClass_schoolId(schoolId).stream()
                .collect(Collectors.toMap(joint -> joint.getId(), Function.identity()));
        validateRequirements(requirements);
        var slots = teachingPeriodGenerator.generateWeeklySlots(settings);
        if (slots.isEmpty()) {
            throw new SchoolResourceBadInputExceptionHandler("no teaching periods generated from school settings");
        }
        return new TimetableGenerationContext(school, settings, requirements, slots, joints);
    }

    private void validateRequirements(List<SubjectRequirement> requirements) {
        for (var requirement : requirements) {
            var joint = requirement.getSubjectJoint();
            if (joint == null || joint.getSubject() == null || joint.getSchoolClass() == null) {
                throw new SchoolResourceBadInputExceptionHandler("subject requirement has an invalid allocation");
            }
            if (joint.getTeacherProfile() == null) {
                throw new SchoolResourceBadInputExceptionHandler(
                        "subject " + joint.getSubject().getSubjectName() + " has no assigned teacher");
            }
            if (!joint.getSchoolClass().getClassId().equals(requirement.getSchoolClass().getClassId())) {
                throw new SchoolResourceBadInputExceptionHandler("subject requirement class does not match allocation");
            }
            if (Boolean.TRUE.equals(requirement.getRequiresDoubleLesson())
                    && requirement.getWeeklyLessons() != null
                    && requirement.getWeeklyLessons() < 2) {
                throw new SchoolResourceBadInputExceptionHandler("double lesson subjects need at least two periods");
            }
        }
    }

    private List<LessonBlock> buildLessonBlocks(TimetableGenerationContext context) {
        var electiveStudents = studentSubjectSelectionRepo.findAllBySchoolId(context.school().getId()).stream()
                .collect(Collectors.groupingBy(
                        selection -> selection.getSubjectJoint().getId(),
                        Collectors.mapping(selection -> selection.getStudentProfile().getId(), Collectors.toSet())));
        var lessons = new ArrayList<LessonBlock>();
        for (var requirement : context.requirements()) {
            int remaining = requirement.getWeeklyLessons();
            int sequence = 1;
            Set<UUID> students = electiveStudents.getOrDefault(requirement.getSubjectJoint().getId(), Set.of());
            while (remaining > 0) {
                int length = Boolean.TRUE.equals(requirement.getRequiresDoubleLesson()) && remaining >= 2 ? 2 : 1;
                if (requirement.getSubjectJoint().getSubjectType() == SubjectType.ELECTIVE && students.isEmpty()) {
                    length = Math.min(length, remaining);
                }
                lessons.add(LessonBlock.from(requirement, length, sequence++, students));
                remaining -= length;
            }
        }
        return lessons;
    }

    private void persistTeachingPeriods(com.example.school.system.models.SchoolSettings settings) {
        var school = settings.getSchool();
        teachingPeriodRepository.deleteBySchoolId(school.getId());
        var periods = teachingPeriodGenerator.generateDailyPeriods(settings).stream().map(period -> {
            var teachingPeriod = new TeachingPeriod();
            teachingPeriod.setSchool(school);
            teachingPeriod.setPeriodNumber(period.periodNumber());
            teachingPeriod.setStartTime(period.startTime());
            teachingPeriod.setEndTime(period.endTime());
            return teachingPeriod;
        }).toList();
        teachingPeriodRepository.saveAll(periods);
    }

    private TimetableReportResponse report(TimetableGenerationResult result, List<TimetableConflict> conflicts,
            int repaired) {
        return new TimetableReportResponse(
                result.durationMs(),
                result.lessonsGenerated(),
                result.lessonsRequired(),
                conflicts.size() + repaired,
                repaired,
                conflicts.size(),
                result.teacherUtilization(),
                result.classUtilization(),
                result.subjectCoverage(),
                result.completenessPercentage(),
                conflicts.stream().map(mapper::toConflictResponse).toList());
    }

    private TimetableReportResponse reportFromEntries(Timetable timetable) {
        int lessonsGenerated = timetable.getEntries().size();
        var teacherUtilization = new LinkedHashMap<UUID, Integer>();
        var classUtilization = new LinkedHashMap<UUID, Integer>();
        var subjectCoverage = new LinkedHashMap<UUID, Integer>();
        for (var entry : timetable.getEntries()) {
            teacherUtilization.merge(entry.getTeacherProfile().getId(), 1, Integer::sum);
            classUtilization.merge(entry.getSchoolClass().getClassId(), 1, Integer::sum);
            subjectCoverage.merge(entry.getSubject().getId(), 1, Integer::sum);
        }
        int lessonsRequired = subjectRequirementRepository.findAllBySchoolId(timetable.getSchool().getId()).stream()
                .mapToInt(SubjectRequirement::getWeeklyLessons)
                .sum();
        var conflicts = conflictDetectionService.detect(timetable.getEntries(), lessonsRequired);
        return new TimetableReportResponse(
                timetable.getGenerationDurationMs(),
                lessonsGenerated,
                lessonsRequired,
                conflicts.size(),
                0,
                conflicts.size(),
                teacherUtilization,
                classUtilization,
                subjectCoverage,
                lessonsRequired == 0 ? 100.0 : lessonsGenerated * 100.0 / lessonsRequired,
                conflicts.stream().map(mapper::toConflictResponse).toList());
    }
}
