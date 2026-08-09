package com.example.school.system.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.school.system.DTO.GradeBandDTO;
import com.example.school.system.DTO.GradeScaleDTO;
import com.example.school.system.DTO.GradeScaleInput;
import com.example.school.system.DTO.DTOResponse.SchoolApiResponse;
import com.example.school.system.models.GradingScale;
import com.example.school.system.services.GradingService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@Slf4j
public class GradeBandController {
    private final GradingService gradingService;

    @GetMapping("/create/grading-scale/{schoolId}")
    public ResponseEntity<?> loadOrCreateGradingScale(@PathVariable UUID schoolId) {
        GradingScale gradingScale = gradingService.getOrCreateDefaultScale(schoolId);
        List<GradeBandDTO> gradeBandDTOs = gradingScale.getBands().stream()
                .map(b -> {
                    GradeBandDTO gradeBandDTO = GradeBandDTO.builder().bandId(b.getId()).grade(b.getGrade())
                            .minScore(b.getMinScore())
                            .maxScore(b.getMaxScore()).points(b.getPoints()).build();
                    return gradeBandDTO;
                }).toList();

        return ResponseEntity.status(200).body(SchoolApiResponse.success(
                GradeScaleDTO.builder().gradeScaleId(gradingScale.getId()).gradeBandDTOs(gradeBandDTOs).build(),
                "Grading configuration added"));
    }

    @PatchMapping("/update/scale")
    public ResponseEntity<?> updateGradeScale(
            @Valid @RequestBody GradeScaleInput gradeScaleInput) {
        gradingService.updateGradeScale(gradeScaleInput);
        return ResponseEntity.status(200).body(SchoolApiResponse.success("Grading scale updated"));
    }

    @DeleteMapping("/delete/grade-band/{id}")
    public ResponseEntity<?> deleteBand(@PathVariable UUID id) {
        gradingService.deleteBand(id);
        return ResponseEntity.status(204).body(SchoolApiResponse.success("band deleted"));
    }
}
