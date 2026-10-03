package com.example.school.system.services;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.repository.AttendanceSheetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceSheetLockBatchService {
    private final AttendanceSheetRepository attendanceSheetRepository;

    @Transactional
    public int lockBatch(List<UUID> ids) {
        return ids.isEmpty() ? 0 : attendanceSheetRepository.lockSubmittedByIds(ids);
    }
}
