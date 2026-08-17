package com.example.school.system.services;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.GradingClassStudents;
import com.example.school.system.DTO.GradingStreamStudents;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.GradeBand;
import com.example.school.system.models.MarksRow;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.types.ExamType;
import com.example.school.system.types.MarksSheetStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
@Service
public class RankingService {
    private final MarksSheetRepo marksSheetRepo;
    private final ClassTermResultsRepo resultsRepo;

    @Transactional
    public void StudentClassRanking(GradingClassStudents event) {
        List<MarksSheet> sheets = marksSheetRepo
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                        event.classId(), event.academicYear(), event.currentSchoolTerm(),
                        event.examType(), MarksSheetStatus.SUBMITTED);

        Map<UUID, StudentAgg> studentMap = aggregateTotals(sheets);
        List<StudentAgg> sorted = sortByTotal(studentMap);

        // CLASS uses STANDARD RANK: 1,1,3,4
        Map<UUID, Integer> classRanks = assignRanksStandard(sorted);
        // STREAM also needs to be per stream
        Map<UUID, Integer> streamRanks = assignRanksDenseByStream(sorted);

        List<ClassTermResults> toSave = buildResults(sorted, event, classRanks, streamRanks,
                event.gradingScale().getBands());
        resultsRepo.saveAll(toSave);
        log.info("Saved {} class results with ranks", toSave.size());
    }

    @Transactional
    public void StudentStreamRanking(GradingStreamStudents event) {
        List<MarksSheet> sheets = marksSheetRepo
                .findAllBySchoolIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                        event.schoolId(), event.academicYear(), event.currentSchoolTerm(),
                        event.examType(), MarksSheetStatus.SUBMITTED); // add status filter

        Map<UUID, StudentAgg> studentMap = aggregateTotals(sheets);
        List<StudentAgg> sorted = sortByTotal(studentMap);

        // STREAM uses DENSE RANK per stream: 1,1,2,3
        Map<UUID, Integer> streamRanks = assignRanksDenseByStream(sorted);
        // Class rank doesn't matter here, set to null or 0
        Map<UUID, Integer> classRanks = new HashMap<>();

        List<ClassTermResults> toSave = buildResults(sorted, event, classRanks, streamRanks,
                event.gradingScale().getBands());
        resultsRepo.saveAll(toSave);
        log.info("Saved {} stream results with dense ranks", toSave.size());
    }

    private Map<UUID, StudentAgg> aggregateTotals(List<MarksSheet> sheets) {
        Map<UUID, StudentAgg> studentMap = new HashMap<>();
        for (MarksSheet sheet : sheets) {
            for (MarksRow row : sheet.getMarks()) {
                UUID id = row.getStudentProfile().getId();
                studentMap.merge(id,
                        new StudentAgg(row.getStudentProfile(), row.getTotalMarks().doubleValue()),
                        (old, n) -> new StudentAgg(old.sp(), old.total() + n.total()));
            }
        }
        return studentMap;
    }

    private List<StudentAgg> sortByTotal(Map<UUID, StudentAgg> studentMap) {
        return studentMap.values().stream()
                .sorted(Comparator.comparing(StudentAgg::total).reversed()
                        .thenComparing(a -> a.sp().getId()))
                .toList();
    }

    // STANDARD RANK: 1, 1, 3, 4 - skips numbers on tie
    private Map<UUID, Integer> assignRanksStandard(List<StudentAgg> sorted) {
        Map<UUID, Integer> ranks = new HashMap<>();
        int position = 0;
        int rank = 0;
        Double prevTotal = null;

        for (StudentAgg agg : sorted) {
            position++;
            if (!Objects.equals(prevTotal, agg.total())) {
                rank = position; // jump to current position
                prevTotal = agg.total();
            }
            ranks.put(agg.sp().getId(), rank);
        }
        return ranks;
    }

    // DENSE RANK: 1, 1, 2, 3 - does NOT skip numbers on tie
    private Map<UUID, Integer> assignRanksDense(List<StudentAgg> sorted) {
        Map<UUID, Integer> ranks = new HashMap<>();
        int rank = 0;
        Double prevTotal = null;

        for (StudentAgg agg : sorted) {
            if (!Objects.equals(prevTotal, agg.total())) {
                rank++; // only increment when score changes
                prevTotal = agg.total();
            }
            ranks.put(agg.sp().getId(), rank);
        }
        return ranks;
    }

    // DENSE RANK but grouped by stream
    private Map<UUID, Integer> assignRanksDenseByStream(List<StudentAgg> all) {
        Map<UUID, Integer> ranks = new HashMap<>();
        Map<UUID, List<StudentAgg>> byStream = all.stream()
                .collect(Collectors.groupingBy(a -> a.sp().getSchoolClass().getClassId()));

        for (List<StudentAgg> streamList : byStream.values()) {
            streamList.sort(Comparator.comparing(StudentAgg::total).reversed()
                    .thenComparing(a -> a.sp().getId()));
            ranks.putAll(assignRanksDense(streamList));
        }
        return ranks;
    }

    private List<ClassTermResults> buildResults(List<StudentAgg> sorted, Object event,
            Map<UUID, Integer> classRanks, Map<UUID, Integer> streamRanks, List<GradeBand> bands) {

        String academicYear;
        Integer term;
        ExamType examType;
        UUID classId;
        if (event instanceof GradingClassStudents e) {
            academicYear = e.academicYear();
            term = e.currentSchoolTerm();
            examType = e.examType();
            classId = e.classId();
        } else {
            GradingStreamStudents e = (GradingStreamStudents) event;
            academicYear = e.academicYear();
            term = e.currentSchoolTerm();
            examType = e.examType();
            classId = null;
        }

        return sorted.stream().map(agg -> {
            ClassTermResults result = resultsRepo
                    .findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                            agg.sp().getId(), academicYear, term, examType)
                    .orElse(new ClassTermResults());

            result.setStudentProfile(agg.sp());
            result.setClassId(classId != null ? classId : agg.sp().getSchoolClass().getClassId());
            result.setAcademicYear(academicYear);
            result.setCurrentSchoolTerm(term);
            result.setExamType(examType);
            result.setTotalMarks(agg.total());
            result.setClassPosition(classRanks.getOrDefault(agg.sp().getId(), 0));
            result.setStreamPosition(streamRanks.get(agg.sp().getId()));
            result.setGrade(calculateOverallGrade(agg.total(), bands));
            return result;
        }).toList();
    }

    private String calculateOverallGrade(Double total, List<GradeBand> gradeBands) {
        return gradeBands.stream()
                .filter(b -> total >= b.getMinScore() && total <= b.getMaxScore())
                .map(GradeBand::getGrade)
                .findFirst()
                .orElse("E");
    }

    record StudentAgg(StudentProfile sp, Double total) {
    }
}
