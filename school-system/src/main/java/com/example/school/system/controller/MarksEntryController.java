package com.example.school.system.controller;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.MarksheetSaveRequest;
import com.example.school.system.services.MarksEntryService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MarksEntryController {
    private final MarksEntryService marksEntryService;

    @GetMapping("/marks/{subjectJointId}")
    public ResponseEntity<?> loadMarksSheet(
            @PathVariable UUID subjectJointId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        var res = marksEntryService.loadMarksEntrySheet(subjectJointId, page, size);
        return ResponseEntity.ok(res);
    }

    // I will eliminate it in future
    @GetMapping("/marks")
    public ResponseEntity<?> getMarks(
            @RequestParam(required = false) UUID subjectId,
            @RequestParam(required = false) String classGrade,
            @RequestParam(required = false) String classStream,
            @RequestParam(required = false) Integer term,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String examType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        if (subjectId == null) {
            return ResponseEntity.ok(List.of());
        }
        var res = marksEntryService.loadMarksForPeriod(subjectId,
                year == null ? null : String.valueOf(year), term, examType, page, size);
        return ResponseEntity.ok(res);
    }
    @PostMapping("/marks/entry")
    public ResponseEntity<?> marksEntry(@Valid @RequestBody MarksheetSaveRequest marksheetSaveRequest) {
        var res = marksEntryService.saveMarks(marksheetSaveRequest);
        return ResponseEntity.status(201).body(res);
    }

    @GetMapping("/marks/averages/teacher/{teacherId}")
    public ResponseEntity<?> getMarksAverages(
            @PathVariable UUID teacherId,
            @RequestParam(required = false) String term,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String examType) {
        return ResponseEntity.ok(Map.of());
    }
}
