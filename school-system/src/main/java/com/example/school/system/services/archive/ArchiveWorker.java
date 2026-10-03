package com.example.school.system.services.archive;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.DTO.archive.ArchiveManifest;
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
    private static final Duration LEASE_HEARTBEAT_INTERVAL = Duration.ofSeconds(30);
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;
    private final ArchiveJobStateService stateService;
    private final ArchiveSnapshotFactory snapshotFactory;
    private final ArchivePdfGenerator pdfGenerator;
    private final R2ObjectStorage objectStorage;
    private final ScheduledExecutorService heartbeatExecutor =
            Executors.newSingleThreadScheduledExecutor(task -> {
                Thread thread = new Thread(task, "archive-lease-heartbeat");
                thread.setDaemon(true);
                return thread;
            });

    @Value("${edunex.archive.worker.batch-size:2}")
    private int configuredBatchSize;

    @Scheduled(fixedDelay = 15000)
    public void processQueuedArchives() {
        stateService.recoverStale(Instant.now());
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
            UUID leaseToken = stateService.claimResult(item.getId());
            if (leaseToken == null) {
                continue;
            }
            processResult(item.getId(), leaseToken);
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
            UUID leaseToken = stateService.claimAttendance(item.getId());
            if (leaseToken == null) {
                continue;
            }
            processAttendanceArchive(item.getId(), leaseToken);
            processed++;
        }
        return processed;
    }

    private void processResult(UUID archiveId, UUID leaseToken) {
        AtomicBoolean leaseLost = new AtomicBoolean();
        ScheduledFuture<?> heartbeat = startHeartbeat(archiveId, leaseToken, true, leaseLost);
        try {
            ArchivePayload payload = snapshotFactory.buildResult(archiveId);
            String attemptPrefix = payload.objectPrefix() + "/attempts/" + leaseToken;
            List<ArchivePayload.StudentFile> studentFiles = new java.util.ArrayList<>();
            List<ArchiveManifest.Artifact> artifacts = new java.util.ArrayList<>();
            for (var student : payload.students()) {
                assertLease(archiveId, leaseToken, true, leaseLost);
                UUID studentId = student.result().student().id();
                byte[] snapshotBytes = snapshotFactory.serialize(student);
                String snapshotHash = ArchiveHash.sha256(snapshotBytes);
                String snapshotKey = attemptPrefix + "/students/" + studentId + ".json";
                assertLease(archiveId, leaseToken, true, leaseLost);
                objectStorage.putAndVerify(
                        snapshotKey, snapshotBytes, "application/json", snapshotHash);
                String pdfKey = attemptPrefix + "/students/" + studentId + ".pdf";
                byte[] pdfBytes = pdfGenerator.generateStudentResult(student);
                String pdfHash = ArchiveHash.sha256(pdfBytes);
                assertLease(archiveId, leaseToken, true, leaseLost);
                objectStorage.putAndVerify(
                        pdfKey, pdfBytes, "application/pdf", pdfHash);
                studentFiles.add(new ArchivePayload.StudentFile(
                        studentId,
                        student.result().student().name(),
                        student.result().student().studentId(),
                        snapshotKey,
                        snapshotHash,
                        snapshotBytes.length,
                        pdfKey,
                        pdfHash,
                        pdfBytes.length));
                artifacts.add(new ArchiveManifest.Artifact(
                        "STUDENT_RESULT_SNAPSHOT", studentId, snapshotKey,
                        "application/json", snapshotHash, snapshotBytes.length));
                artifacts.add(new ArchiveManifest.Artifact(
                        "STUDENT_RESULT_PDF", studentId, pdfKey,
                        "application/pdf", pdfHash, pdfBytes.length));
            }
            assertLease(archiveId, leaseToken, true, leaseLost);
            byte[] classSnapshotBytes = snapshotFactory.serialize(payload.students());
            String classSnapshotKey = attemptPrefix + "/class-snapshot.json";
            String classSnapshotHash = ArchiveHash.sha256(classSnapshotBytes);
            assertLease(archiveId, leaseToken, true, leaseLost);
            R2ObjectStorage.StoredObject classSnapshot = objectStorage.putAndVerify(
                    classSnapshotKey, classSnapshotBytes, "application/json", classSnapshotHash);
            byte[] classPdfBytes = pdfGenerator.generateClassResults(
                    "Edunex Results - " + payload.schoolName() + " - " + payload.academicYear()
                            + " Term " + payload.term() + " " + payload.examType(),
                    payload.students());
            String classPdfKey = attemptPrefix + "/class-report.pdf";
            String classPdfHash = ArchiveHash.sha256(classPdfBytes);
            assertLease(archiveId, leaseToken, true, leaseLost);
            R2ObjectStorage.StoredObject document = objectStorage.putAndVerify(
                    classPdfKey, classPdfBytes, "application/pdf", classPdfHash);
            artifacts.add(new ArchiveManifest.Artifact(
                    "CLASS_RESULT_SNAPSHOT", null, classSnapshotKey, "application/json",
                    classSnapshotHash, classSnapshotBytes.length));
            artifacts.add(new ArchiveManifest.Artifact(
                    "CLASS_RESULT_PDF", null, classPdfKey, "application/pdf",
                    classPdfHash, classPdfBytes.length));
            ArchiveManifest archiveManifest = new ArchiveManifest(
                    "RESULT", payload.archiveId(), payload.version(), payload.schoolId(), payload.classId(),
                    payload.academicYear() + "-T" + payload.term() + "-" + payload.examType(),
                    payload.requestedAt(), "GENERATED_PENDING_VERIFICATION", artifacts);
            byte[] manifestBytes = snapshotFactory.serialize(archiveManifest);
            assertLease(archiveId, leaseToken, true, leaseLost);
            String manifestKey = attemptPrefix + "/manifest.json";
            R2ObjectStorage.StoredObject manifest = objectStorage.putAndVerify(
                    manifestKey, manifestBytes, "application/json", ArchiveHash.sha256(manifestBytes));
            assertLease(archiveId, leaseToken, true, leaseLost);
            stateService.completeResult(
                    archiveId, leaseToken, manifest, classSnapshot, document, studentFiles);
            log.info("Verified results archive {}", archiveId);
        } catch (RuntimeException exception) {
            stateService.failResult(archiveId, leaseToken);
            log.warn("Results archive {} failed ({})", archiveId, exception.getClass().getSimpleName());
        } finally {
            heartbeat.cancel(false);
        }
    }

    private void processAttendanceArchive(UUID archiveId, UUID leaseToken) {
        AtomicBoolean leaseLost = new AtomicBoolean();
        ScheduledFuture<?> heartbeat = startHeartbeat(archiveId, leaseToken, false, leaseLost);
        try {
            ArchiveSnapshotFactory.AttendancePayload payload = snapshotFactory.buildAttendance(archiveId, leaseToken);
            assertLease(archiveId, leaseToken, false, leaseLost);
            String snapshotHash = ArchiveHash.sha256(payload.snapshot());
            assertLease(archiveId, leaseToken, false, leaseLost);
            R2ObjectStorage.StoredObject snapshot = objectStorage.putAndVerify(
                    payload.snapshotKey(), payload.snapshot(), "application/json", snapshotHash);
            assertLease(archiveId, leaseToken, false, leaseLost);
            String documentHash = ArchiveHash.sha256(payload.document());
            assertLease(archiveId, leaseToken, false, leaseLost);
            R2ObjectStorage.StoredObject document = objectStorage.putAndVerify(
                    payload.documentKey(), payload.document(), "application/pdf", documentHash);
            assertLease(archiveId, leaseToken, false, leaseLost);
            String manifestHash = ArchiveHash.sha256(payload.manifest());
            assertLease(archiveId, leaseToken, false, leaseLost);
            R2ObjectStorage.StoredObject manifest = objectStorage.putAndVerify(
                    payload.manifestKey(), payload.manifest(), "application/json", manifestHash);
            assertLease(archiveId, leaseToken, false, leaseLost);
            stateService.completeAttendance(archiveId, leaseToken, manifest, snapshot, document);
            log.info("Verified attendance archive {}", archiveId);
        } catch (RuntimeException exception) {
            stateService.failAttendance(archiveId, leaseToken);
            log.warn("Attendance archive {} failed ({})", archiveId, exception.getClass().getSimpleName());
        } finally {
            heartbeat.cancel(false);
        }
    }

    private ScheduledFuture<?> startHeartbeat(
            UUID archiveId, UUID leaseToken, boolean result, AtomicBoolean leaseLost) {
        return heartbeatExecutor.scheduleWithFixedDelay(() -> {
            if (leaseLost.get()) {
                return;
            }
            try {
                boolean renewed = result
                        ? stateService.heartbeatResult(archiveId, leaseToken)
                        : stateService.heartbeatAttendance(archiveId, leaseToken);
                if (!renewed) {
                    leaseLost.set(true);
                    log.warn("Archive worker lease was lost for archive {}", archiveId);
                }
            } catch (RuntimeException exception) {
                leaseLost.set(true);
                log.warn("Archive worker lease heartbeat failed for archive {} ({})",
                        archiveId, exception.getClass().getSimpleName());
            }
        }, LEASE_HEARTBEAT_INTERVAL.toSeconds(), LEASE_HEARTBEAT_INTERVAL.toSeconds(), TimeUnit.SECONDS);
    }

    private void assertLease(UUID archiveId, UUID leaseToken, boolean result, AtomicBoolean leaseLost) {
        if (leaseLost.get()) {
            throw new IllegalStateException("Archive worker lease was lost");
        }
        boolean owned = result
                ? stateService.heartbeatResult(archiveId, leaseToken)
                : stateService.heartbeatAttendance(archiveId, leaseToken);
        if (!owned) {
            leaseLost.set(true);
            throw new IllegalStateException("Archive worker lease was lost");
        }
    }

    @PreDestroy
    void stopHeartbeatExecutor() {
        heartbeatExecutor.shutdownNow();
    }
}
