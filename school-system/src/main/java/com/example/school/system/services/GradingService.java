package com.example.school.system.services;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.school.system.DTO.GradeBandInput;
import com.example.school.system.DTO.GradeScaleInput;
import com.example.school.system.error.SchoolResourceBadInputExceptionHandler;
import com.example.school.system.error.SchoolResourceExistsExceptionHandler;
import com.example.school.system.error.SchoolResourceNotFoundExceptionHandler;
import com.example.school.system.models.GradeBand;
import com.example.school.system.models.GradingScale;
import com.example.school.system.repository.GradingBandRepo;
import com.example.school.system.repository.GradingScaleRepo;
import com.example.school.system.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GradingService {
    private final GradingScaleRepo gradingScaleRepo;
    private final SchoolRepository schoolRepository;
    private final GradingBandRepo gradingBandRepo;

    @Transactional
    public GradingScale getOrCreateDefaultScale(UUID schoolId) {
        if (!schoolRepository.existsById(schoolId))
            throw new SchoolResourceNotFoundExceptionHandler("school not found");
        return gradingScaleRepo.findBySchoolId(schoolId)
                .orElseGet(() -> createDefaultScaling(schoolId));
    }

    private GradingScale createDefaultScaling(UUID schoolId) {
        GradingScale newGradingScale = new GradingScale();
        List<GradeBand> gradeBands = List.of(
                GradeBand.builder().grade("EE1").minScore(80).maxScore(100).points(8.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("EE2").minScore(65).maxScore(79).points(7.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("ME1").minScore(55).maxScore(64).points(6.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("ME2").minScore(45).maxScore(54).points(5.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("AE1").minScore(35).maxScore(44).points(4.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("AE2").minScore(25).maxScore(34).points(3.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("BE1").minScore(15).maxScore(24).points(2.0)
                        .gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("BE2").minScore(0).maxScore(14).points(1.0)
                        .gradingScale(newGradingScale)
                        .build());
        newGradingScale.setSchoolId(schoolId);
        newGradingScale.setBands(gradeBands);
        gradingScaleRepo.save(newGradingScale);
        return newGradingScale;
    }

    @Transactional
    public void deleteBand(UUID bandId) {
        gradingBandRepo.deleteById(bandId);
    }

    @Transactional
    public void updateGradeScale(GradeScaleInput gradeScaleInput) {
        GradingScale gradingScale = gradingScaleRepo
                .findByIdAndSchoolId(gradeScaleInput.getGradeScaleId(), gradeScaleInput.getSchoolId())
                .orElseThrow(
                        () -> new SchoolResourceNotFoundExceptionHandler(
                                "grading scale not found"));
        validateBands(gradeScaleInput.getGradeBandDTOs());
        // clear old bands
        gradingScale.getBands().clear();

        List<GradeBand> gradeBands = gradeScaleInput.getGradeBandDTOs().stream().map(b -> {
            GradeBand newBGradeBand = new GradeBand();
            newBGradeBand.setGradingScale(gradingScale);
            newBGradeBand.setGrade(b.getGrade());
            newBGradeBand.setMaxScore(b.getMaxScore());
            newBGradeBand.setMinScore(b.getMinScore());
            newBGradeBand.setPoints(b.getPoints());
            return newBGradeBand;
        }).toList();
        ;
        gradingScale.getBands().addAll(gradeBands);
        gradingScaleRepo.save(gradingScale);
    }

    private void validateBands(List<GradeBandInput> bands) {
        if (bands == null || bands.isEmpty())
            throw new SchoolResourceBadInputExceptionHandler("Grade scale cannot be empty");

        // 1. Sort DESC by minScore. This is the source of truth
        List<GradeBandInput> sorted = bands.stream()
                .sorted(Comparator.comparing(GradeBandInput::getMinScore).reversed())
                .toList();

        // 2. Check for duplicate grades
        Set<String> grades = new HashSet<>();
        for (GradeBandInput b : sorted) {
            if (!grades.add(b.getGrade().toUpperCase()))
                throw new SchoolResourceExistsExceptionHandler("Duplicate grade: " + b.getGrade());
        }

        // 3. Check each band is valid
        for (GradeBandInput b : sorted) {
            if (b.getMinScore() < 0 || b.getMaxScore() > 100)
                throw new SchoolResourceBadInputExceptionHandler("Scores must be between 0 and 100");
            if (b.getMinScore() > b.getMaxScore())
                throw new SchoolResourceBadInputExceptionHandler(
                        String.format("Invalid range for %s: min %.2f > max %.2f", b.getGrade(),
                                b.getMinScore(), b.getMaxScore()));
            if (b.getPoints() == null || b.getPoints() < 0)
                throw new SchoolResourceBadInputExceptionHandler(
                        "Points cannot be negative for grade " + b.getGrade());
        }

        // 4. Check for gaps and overlaps between neighbors
        for (int i = 0; i < sorted.size() - 1; i++) {
            GradeBandInput current = sorted.get(i); // higher band
            GradeBandInput next = sorted.get(i + 1); // lower band

            // Overlap: current.min <= next.max
            if (current.getMinScore() <= next.getMaxScore() + 0.001) { // +0.001 for float precision
                throw new SchoolResourceBadInputExceptionHandler(
                        String.format("Overlap: %s %.2f-%.2f overlaps with %s %.2f-%.2f",
                                current.getGrade(), current.getMinScore(),
                                current.getMaxScore(),
                                next.getGrade(), next.getMinScore(),
                                next.getMaxScore()));
            }

            // // Gap: current.min - next.max > 0.01
            // double gap = current.getMinScore() - next.getMaxScore();
            // if (gap > 0.01) {
            // throw new SchoolResourceBadInputExceptionHandler(
            // String.format("Gap of %.2f between %s and %s. Ranges must be continuous.",
            // gap, current.getGrade(), next.getGrade()));
            // }
        }

        // 5. Must cover full 0-100
        GradeBandInput highest = sorted.get(0);
        GradeBandInput lowest = sorted.get(sorted.size() - 1);

        if (highest.getMaxScore() < 99.99)
            throw new SchoolResourceBadInputExceptionHandler(
                    "Highest band must end at 100. Current: " + highest.getMaxScore());
        if (lowest.getMinScore() > 0.01)
            throw new SchoolResourceBadInputExceptionHandler(
                    "Lowest band must start at 0. Current: " + lowest.getMinScore());
    }

}
