package com.example.school.system.schedulers;

import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.school.system.services.AttendanceSheetLockBatchService;
import com.example.school.system.repository.AttendanceSheetRepository;
import com.example.school.system.types.WholeAttendanceSheetStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LockAttendanceSheet {
    private final AttendanceSheetRepository attendanceSheetRepository;
    private final AttendanceSheetLockBatchService lockBatchService;

    @Scheduled(cron = "0 59 23 * * *", zone = "Africa/Nairobi")
    public void LockSheet() {
        int lockedCount = 0;
        while (true) {
            var ids = attendanceSheetRepository.findIdsByStatus(
                    WholeAttendanceSheetStatus.SUBMITTED, PageRequest.of(0, 500));
            if (ids.isEmpty()) {
                break;
            }
            int locked = lockBatchService.lockBatch(ids);
            lockedCount += locked;
            if (locked == 0) {
                break;
            }
        }
        if (lockedCount > 0) {
            org.slf4j.LoggerFactory.getLogger(LockAttendanceSheet.class)
                    .info("Locked {} submitted attendance sheets", lockedCount);
        }
    }

}
