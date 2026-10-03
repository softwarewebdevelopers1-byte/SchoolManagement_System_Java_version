package com.example.school.system.services.archive;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.types.ArchiveStatus;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = { "edunex.archive.enabled", "edunex.archive.r2.enabled" }, havingValue = "true")
public class ArchiveWorker {
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;
    private final ArchiveJobStateService stateService;
    private final ArchiveSnapshotFactory snapshotFactory;
    private final R2ObjectStorage objectStorage;

    @Value("${edunex.archive.worker.batch-size:2}")
    private int configuredBatchSize;

    @Scheduled(fixedDelay = 15000)
    public void processQueuedArchives() {
        stateService.recoverStale(Instant.now().minus(Duration.ofMinutes(20)));
        int batchSize = Math.max(1, Math.min(configuredBatchSize, 10));
        int processed = processResults(batchSize);
        if (processed < batchSize) {
            processAttendance(batchSize - processed);
        }
    }

    private int processResults(int limit) {
        List<ResultArchive> queued = resultArchiveRepository.findTop20ByStatusInOrderByRequestedAtAsc(
                List.of(ArchiveStatus.PENDING));
        int processed = 0;
        for (ResultArchive item : queued) {
            if (processed >= limit) {
                break;
            }
            if (!stateService.claimResult(item.getId())) {
                continue;
            }
            processResult(item.getId());
            processed++;
        }
        return processed;
    }

    private int processAttendance(int limit) {
        List<AttendanceArchive> queued = attendanceArchiveRepository.findTop20ByStatusInOrderByRequestedAtAsc(
                List.of(ArchiveStatus.PENDING));
        int processed = 0;
        for (AttendanceArchive item : queued) {
            if (processed >= limit) {
                break;
            }
            if (!stateService.claimAttendance(item.getId())) {
                continue;
            }
            processAttendanceArchive(item.getId());
            processed++;
        }
        return processed;
    }

    private void processResult(UUID archiveId) {
        try {
            ArchivePayload payload = snapshotFactory.buildResult(archiveId);
            List<R2ObjectStorage.StoredObject> studentObjects = payload.studentFiles().stream()
                    .map(file -> objectStorage.putAndVerify(
                            file.key(), file.content(), "application/json", file.sha256()))
                    .toList();
            R2ObjectStorage.StoredObject manifest = objectStorage.putAndVerify(
                    payload.manifestKey(), payload.manifest(), "application/json",
                    ArchiveHash.sha256(payload.manifest()));
            R2ObjectStorage.StoredObject document = objectStorage.putAndVerify(
                    payload.documentKey(), payload.document(), "application/pdf",
                    ArchiveHash.sha256(payload.document()));
            if (studentObjects.size() != payload.studentFiles().size()) {
                throw new IllegalStateException("Not all student snapshots were verified");
            }
            stateService.completeResult(archiveId, manifest, document, payload.studentFiles());
            log.info("Verified results archive {}", archiveId);
        } catch (RuntimeException exception) {
            stateService.failResult(archiveId);
            log.warn("Results archive {} failed ({})", archiveId, exception.getClass().getSimpleName());
        }
    }

    private void processAttendanceArchive(UUID archiveId) {
        try {
            ArchiveSnapshotFactory.AttendancePayload payload = snapshotFactory.buildAttendance(archiveId);
            R2ObjectStorage.StoredObject snapshot = objectStorage.putAndVerify(
                    payload.snapshotKey(), payload.snapshot(), "application/json",
                    ArchiveHash.sha256(payload.snapshot()));
            R2ObjectStorage.StoredObject document = objectStorage.putAndVerify(
                    payload.documentKey(), payload.document(), "application/pdf",
                    ArchiveHash.sha256(payload.document()));
            stateService.completeAttendance(archiveId, snapshot, document);
            log.info("Verified attendance archive {}", archiveId);
        } catch (RuntimeException exception) {
            stateService.failAttendance(archiveId);
            log.warn("Attendance archive {} failed ({})", archiveId, exception.getClass().getSimpleName());
        }
    }
}
