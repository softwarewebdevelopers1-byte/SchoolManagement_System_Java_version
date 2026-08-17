package com.example.school.system.academicsEvents.listeners;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.example.school.system.academicsEvents.events.GradingClassStudents;
import com.example.school.system.models.ClassTermResults;
import com.example.school.system.models.GradeBand;
import com.example.school.system.models.MarksRow;
import com.example.school.system.models.MarksSheet;
import com.example.school.system.models.StudentProfile;
import com.example.school.system.repository.ClassTermResultsRepo;
import com.example.school.system.repository.MarksSheetRepo;
import com.example.school.system.types.MarksSheetStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class RankingListener {

    private final MarksSheetRepo marksSheetRepo;
    private final ClassTermResultsRepo resultsRepo;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStudentClassRanking(GradingClassStudents event) {
        log.info("Ranking: class={} year={} term={} exam={}",
                event.classId(), event.academicYear(), event.currentSchoolTerm(), event.examType());

        List<MarksSheet> sheets = marksSheetRepo
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                        event.classId(), event.academicYear(), event.currentSchoolTerm(),
                        event.examType(), MarksSheetStatus.SUBMITTED);

        // 1. Aggregate: student -> total
        Map<UUID, StudentAgg> studentMap = new HashMap<>();
        for (MarksSheet sheet : sheets) {
            for (MarksRow row : sheet.getMarks()) {
                UUID id = row.getStudentProfile().getId();
                studentMap.merge(id,
                        new StudentAgg(row.getStudentProfile(), row.getTotalMarks().doubleValue()),
                        (old, n) -> new StudentAgg(old.sp(), old.total() + n.total()));
            }
        }

        // 2. Sort by total DESC, then by studentId for stable tie-break
        List<StudentAgg> sorted = studentMap.values().stream()
                .sorted(Comparator.comparing(StudentAgg::total).reversed()
                        .thenComparing(a -> a.sp().getId()))
                .toList();

        // 3. Assign positions with RANK logic: 1,1,3
        List<ClassTermResults> toSave = new ArrayList<>();
        int position = 0;
        int rank = 0;
        Double prevTotal = null;

        for (StudentAgg agg : sorted) {
            position++;
            if (!Objects.equals(prevTotal, agg.total())) {
                rank = position; // new rank only when total changes
                prevTotal = agg.total();
            }

            ClassTermResults result = resultsRepo
                    .findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                            agg.sp().getId(), event.academicYear(), event.currentSchoolTerm(), event.examType())
                    .orElse(new ClassTermResults());

            result.setStudentProfile(agg.sp());
            result.setClassId(event.classId());
            result.setAcademicYear(event.academicYear());
            result.setCurrentSchoolTerm(event.currentSchoolTerm());
            result.setExamType(event.examType());
            result.setTotalMarks(agg.total());
            result.setClassPosition(rank); // SET HERE
            result.setStreamPosition(rank); // For now same as class. Change if you group by stream
            result.setGrade(calculateOverallGrade(agg.total(), event.gradingScale().getBands()));

            toSave.add(result);
        }

        resultsRepo.saveAll(toSave); // positions already set
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
