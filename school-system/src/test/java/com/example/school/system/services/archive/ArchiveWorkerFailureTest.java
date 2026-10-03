package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.mockito.ArgumentCaptor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;

@ExtendWith(MockitoExtension.class)
class ArchiveWorkerFailureTest {
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ArchiveJobStateService stateService;
    @Mock private ArchiveSnapshotFactory snapshotFactory;
    @Mock private ArchivePdfGenerator pdfGenerator;
    @Mock private R2ObjectStorage objectStorage;

    private ArchiveWorker worker;

    @BeforeEach
    void setUp() {
        worker = new ArchiveWorker(
                resultArchiveRepository, attendanceArchiveRepository, stateService,
                snapshotFactory, pdfGenerator, objectStorage);
    }

    @Test
    void failedR2UploadLeavesArchiveFailedAndDoesNotVerifyIt() {
        UUID archiveId = UUID.randomUUID();
        UUID leaseToken = UUID.randomUUID();
        ResultArchive archive = new ResultArchive();
        archive.setId(archiveId);
        when(resultArchiveRepository.findTop20ByStatusInOrderByRequestedAtAsc(anyList()))
                .thenReturn(List.of(archive));
        when(stateService.claimResult(archiveId)).thenReturn(leaseToken);
        when(snapshotFactory.buildResult(archiveId)).thenReturn(new ArchivePayload(
                archiveId, 1, UUID.randomUUID(), UUID.randomUUID(), "School", "Grade 4 East", "2026", 1,
                com.example.school.system.types.ExamType.OPENER, Instant.now(),
                "schools/school/results/archive/v1", List.of()));
        when(stateService.heartbeatResult(archiveId, leaseToken)).thenReturn(true);
        when(snapshotFactory.serialize(any())).thenReturn("{ }".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        when(objectStorage.putAndVerify(any(), any(), any(), any()))
                .thenThrow(new ArchiveStorageUnavailableException());

        worker.processQueuedArchives();

        verify(stateService).failResult(archiveId, leaseToken);
        verify(stateService, never()).completeResult(
                eq(archiveId), eq(leaseToken), any(), any(), any(), anyList());
    }

    @Test
    void stopsBeforeUploadWhenLeaseIsLost() {
        UUID archiveId = UUID.randomUUID();
        UUID leaseToken = UUID.randomUUID();
        ResultArchive archive = new ResultArchive();
        archive.setId(archiveId);
        when(resultArchiveRepository.findTop20ByStatusInOrderByRequestedAtAsc(anyList()))
                .thenReturn(List.of(archive));
        when(stateService.claimResult(archiveId)).thenReturn(leaseToken);
        when(snapshotFactory.buildResult(archiveId)).thenReturn(new ArchivePayload(
                archiveId, 1, UUID.randomUUID(), UUID.randomUUID(), "School", "Grade 4 East", "2026", 1,
                com.example.school.system.types.ExamType.OPENER, Instant.now(),
                "schools/school/results/archive/v1", List.of()));
        when(stateService.heartbeatResult(archiveId, leaseToken)).thenReturn(false);

        worker.processQueuedArchives();

        verify(objectStorage, never()).putAndVerify(any(), any(), any(), any());
        verify(stateService).failResult(archiveId, leaseToken);
        verify(stateService, never()).completeResult(
                eq(archiveId), eq(leaseToken), any(), any(), any(), anyList());
    }

    @Test
    void retriesUseDifferentAttemptScopedObjectKeys() {
        UUID archiveId = UUID.randomUUID();
        UUID firstLease = UUID.randomUUID();
        UUID secondLease = UUID.randomUUID();
        ResultArchive archive = new ResultArchive();
        archive.setId(archiveId);
        when(resultArchiveRepository.findTop20ByStatusInOrderByRequestedAtAsc(anyList()))
                .thenReturn(List.of(archive));
        when(stateService.claimResult(archiveId)).thenReturn(firstLease, secondLease);
        when(snapshotFactory.buildResult(archiveId)).thenReturn(new ArchivePayload(
                archiveId, 1, UUID.randomUUID(), UUID.randomUUID(), "School", "Grade 4 East", "2026", 1,
                com.example.school.system.types.ExamType.OPENER, Instant.now(),
                "schools/school/results/archive/v1", List.of()));
        when(stateService.heartbeatResult(archiveId, firstLease)).thenReturn(true);
        when(stateService.heartbeatResult(archiveId, secondLease)).thenReturn(true);
        when(snapshotFactory.serialize(any())).thenReturn("{ }".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        when(objectStorage.putAndVerify(any(), any(), any(), any()))
                .thenThrow(new ArchiveStorageUnavailableException());

        worker.processQueuedArchives();
        worker.processQueuedArchives();

        ArgumentCaptor<String> key = ArgumentCaptor.forClass(String.class);
        verify(objectStorage, org.mockito.Mockito.times(2))
                .putAndVerify(key.capture(), any(), any(), any());
        assertTrue(key.getAllValues().get(0).contains("/attempts/" + firstLease + "/"));
        assertTrue(key.getAllValues().get(1).contains("/attempts/" + secondLease + "/"));
        assertNotEquals(key.getAllValues().get(0), key.getAllValues().get(1));
    }
}
