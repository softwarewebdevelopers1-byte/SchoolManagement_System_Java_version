package com.example.school.system.services.timetable;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.example.school.system.types.SubjectTimePreference;
import com.example.school.system.types.TimetableConflictType;

@Service
public class TimetableBacktrackingSolver {
    private static final int MAX_SEARCH_NODES = 500_000;

    public TimetableGenerationResult solve(List<LessonBlock> lessonBlocks, List<GeneratedSlot> weeklySlots) {
        var started = Instant.now();
        var orderedLessons = lessonBlocks.stream()
                .sorted(Comparator.comparingInt(this::difficultyScore).reversed()
                        .thenComparing(LessonBlock::classId)
                        .thenComparing(LessonBlock::subjectId)
                        .thenComparingInt(LessonBlock::sequence))
                .toList();

        var state = new SearchState(weeklySlots);
        boolean solved = backtrack(orderedLessons, state);
        long duration = java.time.Duration.between(started, Instant.now()).toMillis();
        var scheduled = solved ? List.copyOf(state.scheduledLessons) : List.<ScheduledLesson>of();
        var conflicts = solved ? List.<TimetableConflict>of() : buildFailureConflicts(orderedLessons, state);
        return new TimetableGenerationResult(
                solved,
                scheduled,
                conflicts,
                duration,
                lessonBlocks.stream().mapToInt(LessonBlock::length).sum(),
                scheduled.stream().mapToInt(s -> s.lessonBlock().length()).sum(),
                utilizationByTeacher(scheduled),
                utilizationByClass(scheduled),
                coverageBySubject(scheduled));
    }

    private boolean backtrack(List<LessonBlock> remaining, SearchState state) {
        if (remaining.isEmpty()) {
            return true;
        }
        if (++state.visitedNodes > MAX_SEARCH_NODES) {
            return false;
        }
        var selected = selectNextLesson(remaining, state);
        if (selected.isEmpty()) {
            return false;
        }
        var lesson = selected.get();
        var nextRemaining = new ArrayList<>(remaining);
        nextRemaining.remove(lesson);
        for (var slot : candidateSlots(lesson, state)) {
            if (state.canPlace(lesson, slot)) {
                state.place(lesson, slot);
                if (backtrack(nextRemaining, state)) {
                    return true;
                }
                state.remove(lesson, slot);
            }
        }
        state.failedLesson = lesson;
        return false;
    }

    private Optional<LessonBlock> selectNextLesson(List<LessonBlock> remaining, SearchState state) {
        return remaining.stream()
                .min(Comparator.comparingInt((LessonBlock lesson) -> candidateSlots(lesson, state).size())
                        .thenComparing(Comparator.comparingInt(this::difficultyScore).reversed())
                        .thenComparing(LessonBlock::classId)
                        .thenComparing(LessonBlock::subjectId)
                        .thenComparingInt(LessonBlock::sequence));
    }

    private List<GeneratedSlot> candidateSlots(LessonBlock lesson, SearchState state) {
        return state.weeklySlots.stream()
                .filter(slot -> state.canStartBlockAt(lesson, slot))
                .sorted(Comparator.comparingInt((GeneratedSlot slot) -> candidateScore(lesson, slot, state))
                        .thenComparing(GeneratedSlot::dayOfWeek)
                        .thenComparing(GeneratedSlot::periodNumber))
                .toList();
    }

    private int difficultyScore(LessonBlock lesson) {
        int score = lesson.length() * 100;
        if (lesson.isElective()) {
            score += 80 + lesson.electiveStudentIds().size();
        }
        return score;
    }

    private int candidateScore(LessonBlock lesson, GeneratedSlot slot, SearchState state) {
        int score = 0;
        score += state.subjectDayCount(lesson.classId(), lesson.subjectId(), slot.dayOfWeek()) * 25;
        score += state.teacherDayLoad(lesson.teacherId(), slot.dayOfWeek()) * 4;
        score += state.classDayLoad(lesson.classId(), slot.dayOfWeek()) * 2;
        if (lesson.timePreference() == SubjectTimePreference.MORNING) {
            score += slot.periodNumber();
        } else if (lesson.timePreference() == SubjectTimePreference.AFTERNOON) {
            score += Math.max(0, state.periodsPerDay - slot.periodNumber());
        }
        return score;
    }

    private List<TimetableConflict> buildFailureConflicts(List<LessonBlock> orderedLessons, SearchState state) {
        var failed = state.failedLesson == null && !orderedLessons.isEmpty() ? orderedLessons.get(0) : state.failedLesson;
        if (failed == null) {
            return List.of(TimetableConflict.error(
                    TimetableConflictType.MISSING_LESSON,
                    "No feasible timetable could be produced from the provided settings and requirements.",
                    null, null, null, null, null));
        }
        return List.of(TimetableConflict.error(
                TimetableConflictType.MISSING_LESSON,
                "No valid slot remained for " + failed.subjectName() + " in class " + failed.classId()
                        + ". Add capacity, reduce weekly frequency, or review teacher/elective constraints.",
                failed.classId(),
                failed.teacherId(),
                failed.subjectId(),
                null,
                null));
    }

    private Map<UUID, Integer> utilizationByTeacher(List<ScheduledLesson> scheduled) {
        var result = new LinkedHashMap<UUID, Integer>();
        for (var lesson : scheduled) {
            result.merge(lesson.lessonBlock().teacherId(), lesson.lessonBlock().length(), Integer::sum);
        }
        return result;
    }

    private Map<UUID, Integer> utilizationByClass(List<ScheduledLesson> scheduled) {
        var result = new LinkedHashMap<UUID, Integer>();
        for (var lesson : scheduled) {
            result.merge(lesson.lessonBlock().classId(), lesson.lessonBlock().length(), Integer::sum);
        }
        return result;
    }

    private Map<UUID, Integer> coverageBySubject(List<ScheduledLesson> scheduled) {
        var result = new LinkedHashMap<UUID, Integer>();
        for (var lesson : scheduled) {
            result.merge(lesson.lessonBlock().subjectId(), lesson.lessonBlock().length(), Integer::sum);
        }
        return result;
    }

    private static final class SearchState {
        private final List<GeneratedSlot> weeklySlots;
        private final Map<SlotKey, GeneratedSlot> slotLookup;
        private final int periodsPerDay;
        private final Set<ResourceSlotKey> classSlots = new HashSet<>();
        private final Set<ResourceSlotKey> teacherSlots = new HashSet<>();
        private final Map<SlotKey, Set<UUID>> electiveStudentSlots = new HashMap<>();
        private final Map<SubjectDayKey, Integer> subjectDayCounts = new HashMap<>();
        private final Map<ResourceDayKey, Integer> teacherDayLoads = new HashMap<>();
        private final Map<ResourceDayKey, Integer> classDayLoads = new HashMap<>();
        private final List<ScheduledLesson> scheduledLessons = new ArrayList<>();
        private LessonBlock failedLesson;
        private int visitedNodes;

        private SearchState(List<GeneratedSlot> weeklySlots) {
            this.weeklySlots = weeklySlots;
            this.slotLookup = new HashMap<>();
            int maxPeriod = 0;
            for (var slot : weeklySlots) {
                slotLookup.put(new SlotKey(slot.dayOfWeek(), slot.periodNumber()), slot);
                maxPeriod = Math.max(maxPeriod, slot.periodNumber());
            }
            this.periodsPerDay = maxPeriod;
        }

        private boolean canStartBlockAt(LessonBlock lesson, GeneratedSlot firstSlot) {
            for (int offset = 0; offset < lesson.length(); offset++) {
                var slot = slotLookup.get(new SlotKey(firstSlot.dayOfWeek(), firstSlot.periodNumber() + offset));
                if (slot == null) {
                    return false;
                }
            }
            return true;
        }

        private boolean canPlace(LessonBlock lesson, GeneratedSlot firstSlot) {
            for (int offset = 0; offset < lesson.length(); offset++) {
                var slotKey = new SlotKey(firstSlot.dayOfWeek(), firstSlot.periodNumber() + offset);
                if (classSlots.contains(new ResourceSlotKey(lesson.classId(), slotKey))
                        || teacherSlots.contains(new ResourceSlotKey(lesson.teacherId(), slotKey))) {
                    return false;
                }
                if (lesson.isElective() && hasElectiveStudentClash(lesson, slotKey)) {
                    return false;
                }
            }
            return true;
        }

        private boolean hasElectiveStudentClash(LessonBlock lesson, SlotKey slotKey) {
            var occupiedStudents = electiveStudentSlots.getOrDefault(slotKey, Set.of());
            for (var studentId : lesson.electiveStudentIds()) {
                if (occupiedStudents.contains(studentId)) {
                    return true;
                }
            }
            return false;
        }

        private void place(LessonBlock lesson, GeneratedSlot firstSlot) {
            for (int offset = 0; offset < lesson.length(); offset++) {
                var slotKey = new SlotKey(firstSlot.dayOfWeek(), firstSlot.periodNumber() + offset);
                classSlots.add(new ResourceSlotKey(lesson.classId(), slotKey));
                teacherSlots.add(new ResourceSlotKey(lesson.teacherId(), slotKey));
                if (lesson.isElective()) {
                    electiveStudentSlots.computeIfAbsent(slotKey, ignored -> new HashSet<>())
                            .addAll(lesson.electiveStudentIds());
                }
            }
            subjectDayCounts.merge(new SubjectDayKey(lesson.classId(), lesson.subjectId(), firstSlot.dayOfWeek()),
                    lesson.length(), Integer::sum);
            teacherDayLoads.merge(new ResourceDayKey(lesson.teacherId(), firstSlot.dayOfWeek()), lesson.length(),
                    Integer::sum);
            classDayLoads.merge(new ResourceDayKey(lesson.classId(), firstSlot.dayOfWeek()), lesson.length(),
                    Integer::sum);
            scheduledLessons.add(new ScheduledLesson(lesson, firstSlot));
        }

        private void remove(LessonBlock lesson, GeneratedSlot firstSlot) {
            for (int offset = 0; offset < lesson.length(); offset++) {
                var slotKey = new SlotKey(firstSlot.dayOfWeek(), firstSlot.periodNumber() + offset);
                classSlots.remove(new ResourceSlotKey(lesson.classId(), slotKey));
                teacherSlots.remove(new ResourceSlotKey(lesson.teacherId(), slotKey));
                if (lesson.isElective()) {
                    var students = electiveStudentSlots.get(slotKey);
                    if (students != null) {
                        students.removeAll(lesson.electiveStudentIds());
                        if (students.isEmpty()) {
                            electiveStudentSlots.remove(slotKey);
                        }
                    }
                }
            }
            decrement(subjectDayCounts, new SubjectDayKey(lesson.classId(), lesson.subjectId(), firstSlot.dayOfWeek()),
                    lesson.length());
            decrement(teacherDayLoads, new ResourceDayKey(lesson.teacherId(), firstSlot.dayOfWeek()), lesson.length());
            decrement(classDayLoads, new ResourceDayKey(lesson.classId(), firstSlot.dayOfWeek()), lesson.length());
            scheduledLessons.remove(scheduledLessons.size() - 1);
        }

        private int subjectDayCount(UUID classId, UUID subjectId, DayOfWeek dayOfWeek) {
            return subjectDayCounts.getOrDefault(new SubjectDayKey(classId, subjectId, dayOfWeek), 0);
        }

        private int teacherDayLoad(UUID teacherId, DayOfWeek dayOfWeek) {
            return teacherDayLoads.getOrDefault(new ResourceDayKey(teacherId, dayOfWeek), 0);
        }

        private int classDayLoad(UUID classId, DayOfWeek dayOfWeek) {
            return classDayLoads.getOrDefault(new ResourceDayKey(classId, dayOfWeek), 0);
        }

        private <K> void decrement(Map<K, Integer> map, K key, int amount) {
            int next = map.getOrDefault(key, 0) - amount;
            if (next <= 0) {
                map.remove(key);
            } else {
                map.put(key, next);
            }
        }
    }

    private record SlotKey(DayOfWeek dayOfWeek, Integer periodNumber) {
    }

    private record ResourceSlotKey(UUID resourceId, SlotKey slotKey) {
    }

    private record ResourceDayKey(UUID resourceId, DayOfWeek dayOfWeek) {
    }

    private record SubjectDayKey(UUID classId, UUID subjectId, DayOfWeek dayOfWeek) {
    }
}
