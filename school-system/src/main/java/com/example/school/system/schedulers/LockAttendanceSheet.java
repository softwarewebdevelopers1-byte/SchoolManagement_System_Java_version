package com.example.school.system.schedulers;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.school.system.repository.AttendanceSheetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LockAttendanceSheet {
    private final AttendanceSheetRepository attendanceSheetRepository;

    @Scheduled(cron = "0 59 23 * * *")
    public void LockSheet() {
    }

}
