package com.example.school.system.academicsEvents.listeners;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
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
    @Transactional
    public void handleStudentClassRanking(GradingClassStudents event) {
        log.info("Ranking: class={} year={} term={} exam={}",
                event.classId(), event.academicYear(), event.currentSchoolTerm(), event.examType());

        // 1. Get all SUBMITTED sheets for this class+year+term+exam
        List<MarksSheet> sheets = marksSheetRepo
                .findAllByClassIdAndAcademicYearAndCurrentSchoolTermAndExamTypeAndStatus(
                        event.classId(), event.academicYear(), event.currentSchoolTerm(),
                        event.examType(), MarksSheetStatus.SUBMITTED);

        // 2. Aggregate: Sum totalMarks from each MarksRow across all subjects
        Map<UUID, Double> studentTotalMap = new HashMap<>(); // studentId -> sum of all subject totals

        for (MarksSheet sheet : sheets) {
            for (MarksRow row : sheet.getMarks()) { // you called it "marks"
                UUID studentId = row.getStudentProfile().getId();
                studentTotalMap.merge(studentId, row.getTotalMarks().doubleValue(), Double::sum);
            }
        }

        // 3. Save/Update ClassTermResults
        List<ClassTermResults> toSave = new ArrayList<>();
        for (Map.Entry<UUID, Double> entry : studentTotalMap.entrySet()) {
            UUID studentId = entry.getKey();
            Double total = entry.getValue();

            ClassTermResults result = resultsRepo
                    .findByStudentProfile_IdAndAcademicYearAndCurrentSchoolTermAndExamType(
                            studentId, event.academicYear(), event.currentSchoolTerm(), event.examType())
                    .orElse(new ClassTermResults());

            // Assuming you can get studentProfile from first row
            StudentProfile sp = sheets.get(0).getMarks().stream()
                    .filter(r -> r.getStudentProfile().getId().equals(studentId))
                    .findFirst().get().getStudentProfile();

            result.setStudentProfile(sp);
            result.setClassId(event.classId());
            result.setAcademicYear(event.academicYear());
            result.setCurrentSchoolTerm(event.currentSchoolTerm());
            result.setExamType(event.examType());
            result.setTotalMarks(total);
            result.setGrade(calculateOverallGrade(total, event.gradingScale().getBands())); // Optional

            toSave.add(result);
        }

        resultsRepo.saveAll(toSave);

        // 4. Rank everyone
        resultsRepo.rankStudentsForClassTerm(event.classId(), event.academicYear(), event.currentSchoolTerm(),
                event.examType());
    }

    private String calculateOverallGrade(Double total,
            List<GradeBand> gradeBands) {
        // Adjust to your school total bands. Example: 12 subjects * 100 = 1200
        return gradeBands.stream().filter(b -> total >= b.getMinScore() && total <= b.getMaxScore())
                .map(g -> g.getGrade()).findFirst()
                .orElse("E");
    }
}
