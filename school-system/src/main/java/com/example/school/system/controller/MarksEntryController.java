package com.example.school.system.controller;

import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.school.system.DTO.MarksheetSaveRequest;
import com.example.school.system.services.MarksEntryService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MarksEntryController {
    private final MarksEntryService marksEntryService;

    @GetMapping("/marks/{subjectJointId}")
    public ResponseEntity<?> LoadMarksSheet(@PathVariable UUID subjectJointId) {
        var res = marksEntryService.loadMarksEntrySheet(subjectJointId);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/marks/entry")
    public ResponseEntity<?> marksEntry(@RequestBody MarksheetSaveRequest marksheetSaveRequest) {
        var res = marksEntryService.saveMarks(marksheetSaveRequest);
        return ResponseEntity.status(201).body(res);
    }
}
