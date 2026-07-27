package com.example.school.system.schedulers;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.models.AttendanceSheet;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.types.WholeAttendanceSheetStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LockAttendanceSheet {
    private final AttendanceSheetRepository attendanceSheetRepository;

    @Transactional
    @Scheduled(cron = "0 59 23 * * *", zone = "Africa/Nairobi")
    public void LockSheet() {
        List<AttendanceSheet> sheets = attendanceSheetRepository.findAllByStatus(WholeAttendanceSheetStatus.SUBMITTED);
        sheets.forEach(s -> {
            s.setStatus(WholeAttendanceSheetStatus.LOCKED);
        });
        attendanceSheetRepository.saveAll(sheets);
    }

}

