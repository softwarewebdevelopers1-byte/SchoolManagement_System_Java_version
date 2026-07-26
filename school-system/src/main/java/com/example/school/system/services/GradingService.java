package com.example.school.system.services;

import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import com.example.school.system.models.GradeBand;
import com.example.school.system.models.GradingScale;
import com.example.school.system.repository.GradingScaleRepo;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GradingService {
    private final GradingScaleRepo gradingScaleRepo;

    public GradingScale getOrCreateDefaultScale(UUID schoolId) {
        return gradingScaleRepo.findBySchoolId(schoolId)
                .orElseGet(() -> createDefaultScaling(schoolId));
    }

    private GradingScale createDefaultScaling(UUID schoolId) {
        GradingScale newGradingScale = new GradingScale();
        List<GradeBand> gradeBands = List.of(
                GradeBand.builder().grade("A").minScore(80).maxScore(100).points(12.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("A-").minScore(75).maxScore(79).points(11.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("B+").minScore(70).maxScore(74).points(10.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("B").minScore(65).maxScore(69).points(9.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("B-").minScore(60).maxScore(64).points(8.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("C+").minScore(55).maxScore(59).points(7.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("C").minScore(50).maxScore(54).points(6.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("C-").minScore(45).maxScore(49).points(5.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("D+").minScore(40).maxScore(44).points(4.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("D").minScore(35).maxScore(39).points(3.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("D-").minScore(30).maxScore(34).points(2.0).gradingScale(newGradingScale)
                        .build(),
                GradeBand.builder().grade("E").minScore(0).maxScore(29).points(1.0).gradingScale(newGradingScale)
                        .build());
        newGradingScale.setSchoolId(schoolId);
        newGradingScale.setBands(gradeBands);
        gradingScaleRepo.save(newGradingScale);
        return newGradingScale;
    }
}
