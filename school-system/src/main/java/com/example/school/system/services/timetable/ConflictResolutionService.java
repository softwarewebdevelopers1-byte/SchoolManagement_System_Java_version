package com.example.school.system.services.timetable;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class ConflictResolutionService {
    public int attemptRepair(List<TimetableConflict> conflicts) {
        return conflicts.isEmpty() ? 0 : 0;
    }
}
