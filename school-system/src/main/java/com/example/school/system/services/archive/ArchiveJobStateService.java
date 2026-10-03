package com.example.school.system.services.archive;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.school.system.models.AttendanceArchive;
import com.example.school.system.models.ResultArchive;
import com.example.school.system.models.ResultArchiveStudent;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.types.ArchiveStatus;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = { "edunex.archive.enabled", "edunex.archive.r2.enabled" }, havingValue = "true")
public class ArchiveJobStateService {
    private final ResultArchiveRepository resultArchiveRepository;
    private final AttendanceArchiveRepository attendanceArchiveRepository;
    private final ResultArchiveStudentRepository resultArchiveStudentRepository;

    @Transactional
    public int recoverStale(Instant cutoff) {
        return resultArchiveRepository.recoverStale(cutoff) + attendanceArchiveRepository.recoverStale(cutoff);
    }

    @Transactional
    public boolean claimResult(UUID id) {
        return resultArchiveRepository.claimPending(id) == 1;
    }

    @Transactional
    public boolean claimAttendance(UUID id) {
        return attendanceArchiveRepository.claimPending(id) == 1;
    }

    @Transactional
    public void completeResult(
            UUID id,
            R2ObjectStorage.StoredObject manifest,
            R2ObjectStorage.StoredObject document,
            List<ArchivePayload.StudentFile> studentFiles) {
        ResultArchive archive = resultArchiveRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Result archive disappeared during processing"));
        if (archive.getStatus() != ArchiveStatus.PROCESSING) {
            throw new IllegalStateException("Result archive is no longer claimed by this worker");
        }
        List<ResultArchiveStudent> records = studentFiles.stream().map(file -> {
            ResultArchiveStudent student = new ResultArchiveStudent();
            student.setArchive(archive);
            student.setStudentId(file.studentId());
            student.setSnapshotKey(file.key());
            student.setSnapshotSha256(file.sha256());
            student.setSnapshotSize((long) file.content().length);
            return student;
        }).toList();
        resultArchiveStudentRepository.saveAll(records);
        archive.setSnapshotKey(manifest.key());
        archive.setSnapshotSha256(manifest.sha256());
        archive.setSnapshotSize(manifest.size());
        archive.setDocumentKey(document.key());
        archive.setDocumentSha256(document.sha256());
        archive.setDocumentSize(document.size());
        archive.setVerifiedAt(Instant.now());
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setCleanupEligible(false);
        archive.setLastError(null);
        resultArchiveRepository.save(archive);
    }

    @Transactional
    public void completeAttendance(
            UUID id,
            R2ObjectStorage.StoredObject snapshot,
            R2ObjectStorage.StoredObject document) {
        AttendanceArchive archive = attendanceArchiveRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Attendance archive disappeared during processing"));
        if (archive.getStatus() != ArchiveStatus.PROCESSING) {
            throw new IllegalStateException("Attendance archive is no longer claimed by this worker");
        }
        archive.setSnapshotKey(snapshot.key());
        archive.setSnapshotSha256(snapshot.sha256());
        archive.setSnapshotSize(snapshot.size());
        archive.setDocumentKey(document.key());
        archive.setDocumentSha256(document.sha256());
        archive.setDocumentSize(document.size());
        archive.setVerifiedAt(Instant.now());
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setCleanupEligible(false);
        archive.setLastError(null);
        attendanceArchiveRepository.save(archive);
    }

    @Transactional
    public void failResult(UUID id) {
        resultArchiveRepository.findById(id).ifPresent(archive -> {
            if (archive.getStatus() != ArchiveStatus.PROCESSING) {
                return;
            }
            archive.setStatus(ArchiveStatus.FAILED);
            archive.setLastError("Snapshot or R2 upload/verification failed. Source records were preserved.");
            archive.setCleanupEligible(false);
            resultArchiveRepository.save(archive);
        });
    }

    @Transactional
    public void failAttendance(UUID id) {
        attendanceArchiveRepository.findById(id).ifPresent(archive -> {
            if (archive.getStatus() != ArchiveStatus.PROCESSING) {
                return;
            }
            archive.setStatus(ArchiveStatus.FAILED);
            archive.setLastError("Snapshot or R2 upload/verification failed. Source records were preserved.");
            archive.setCleanupEligible(false);
            attendanceArchiveRepository.save(archive);
        });
    }
}
