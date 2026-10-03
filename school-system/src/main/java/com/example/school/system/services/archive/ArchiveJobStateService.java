package com.example.school.system.services.archive;

import java.time.Instant;
import java.time.Duration;
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
    public UUID claimResult(UUID id) {
        UUID token = UUID.randomUUID();
        return resultArchiveRepository.claimPending(id, token, leaseExpiry()) == 1 ? token : null;
    }

    @Transactional
    public UUID claimAttendance(UUID id) {
        UUID token = UUID.randomUUID();
        return attendanceArchiveRepository.claimPending(id, token, leaseExpiry()) == 1 ? token : null;
    }

    @Transactional
    public boolean heartbeatResult(UUID id, UUID leaseToken) {
        return resultArchiveRepository.renewLease(id, leaseToken, leaseExpiry()) == 1;
    }

    @Transactional
    public boolean heartbeatAttendance(UUID id, UUID leaseToken) {
        return attendanceArchiveRepository.renewLease(id, leaseToken, leaseExpiry()) == 1;
    }

    @Transactional
    public void completeResult(
            UUID id,
            UUID leaseToken,
            R2ObjectStorage.StoredObject manifest,
            R2ObjectStorage.StoredObject classSnapshot,
            R2ObjectStorage.StoredObject document,
            List<ArchivePayload.StudentFile> studentFiles) {
        ResultArchive archive = resultArchiveRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Result archive disappeared during processing"));
        if (archive.getStatus() != ArchiveStatus.PROCESSING || !leaseToken.equals(archive.getLeaseToken())) {
            throw new IllegalStateException("Result archive is no longer claimed by this worker");
        }
        ResultArchive superseded = null;
        if (archive.getSupersedesArchiveId() != null) {
            superseded = resultArchiveRepository.findById(archive.getSupersedesArchiveId())
                    .orElseThrow(() -> new IllegalStateException("Previous verified archive version is missing"));
            if (superseded.getStatus() != ArchiveStatus.VERIFIED
                    || superseded.getVersion() == null
                    || archive.getVersion() == null
                    || superseded.getVersion() + 1 != archive.getVersion()
                    || superseded.getSchoolId() == null
                    || !superseded.getSchoolId().equals(archive.getSchoolId())) {
                throw new IllegalStateException("Previous archive version is not eligible for superseding");
            }
        }
        resultArchiveStudentRepository.deleteAllForArchive(archive.getId());
        List<ResultArchiveStudent> records = studentFiles.stream().map(file -> {
            ResultArchiveStudent student = new ResultArchiveStudent();
            student.setArchive(archive);
            student.setStudentId(file.studentId());
            student.setStudentName(file.studentName());
            student.setAdmissionNumber(file.admissionNumber());
            student.setSnapshotKey(file.snapshotKey());
            student.setSnapshotSha256(file.snapshotSha256());
            student.setSnapshotSize(file.snapshotSize());
            student.setDocumentKey(file.documentKey());
            student.setDocumentSha256(file.documentSha256());
            student.setDocumentSize(file.documentSize());
            return student;
        }).toList();
        resultArchiveStudentRepository.saveAll(records);
        archive.setSnapshotKey(manifest.key());
        archive.setSnapshotSha256(manifest.sha256());
        archive.setSnapshotSize(manifest.size());
        archive.setClassSnapshotKey(classSnapshot.key());
        archive.setClassSnapshotSha256(classSnapshot.sha256());
        archive.setClassSnapshotSize(classSnapshot.size());
        archive.setDocumentKey(document.key());
        archive.setDocumentSha256(document.sha256());
        archive.setDocumentSize(document.size());
        archive.setVerifiedAt(Instant.now());
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setLeaseToken(null);
        archive.setLeaseExpiresAt(null);
        archive.setCleanupEligible(false);
        archive.setLastError(null);
        resultArchiveRepository.save(archive);
        if (superseded != null) {
            superseded.setStatus(ArchiveStatus.SUPERSEDED);
            superseded.setCleanupEligible(false);
            resultArchiveRepository.save(superseded);
        }
    }

    @Transactional
    public void completeAttendance(
            UUID id,
            UUID leaseToken,
            R2ObjectStorage.StoredObject manifest,
            R2ObjectStorage.StoredObject snapshot,
            R2ObjectStorage.StoredObject document) {
        AttendanceArchive archive = attendanceArchiveRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Attendance archive disappeared during processing"));
        if (archive.getStatus() != ArchiveStatus.PROCESSING || !leaseToken.equals(archive.getLeaseToken())) {
            throw new IllegalStateException("Attendance archive is no longer claimed by this worker");
        }
        archive.setManifestKey(manifest.key());
        archive.setManifestSha256(manifest.sha256());
        archive.setManifestSize(manifest.size());
        archive.setSnapshotKey(snapshot.key());
        archive.setSnapshotSha256(snapshot.sha256());
        archive.setSnapshotSize(snapshot.size());
        archive.setDocumentKey(document.key());
        archive.setDocumentSha256(document.sha256());
        archive.setDocumentSize(document.size());
        archive.setVerifiedAt(Instant.now());
        archive.setStatus(ArchiveStatus.VERIFIED);
        archive.setLeaseToken(null);
        archive.setLeaseExpiresAt(null);
        archive.setCleanupEligible(false);
        archive.setLastError(null);
        attendanceArchiveRepository.save(archive);
    }

    @Transactional
    public void failResult(UUID id, UUID leaseToken) {
        resultArchiveRepository.findById(id).ifPresent(archive -> {
            if (archive.getStatus() != ArchiveStatus.PROCESSING || !leaseToken.equals(archive.getLeaseToken())) {
                return;
            }
            archive.setStatus(ArchiveStatus.FAILED);
            archive.setLeaseToken(null);
            archive.setLeaseExpiresAt(null);
            archive.setLastError("Snapshot or R2 upload/verification failed. Source records were preserved.");
            archive.setCleanupEligible(false);
            resultArchiveRepository.save(archive);
        });
    }

    @Transactional
    public void failAttendance(UUID id, UUID leaseToken) {
        attendanceArchiveRepository.findById(id).ifPresent(archive -> {
            if (archive.getStatus() != ArchiveStatus.PROCESSING || !leaseToken.equals(archive.getLeaseToken())) {
                return;
            }
            archive.setStatus(ArchiveStatus.FAILED);
            archive.setLeaseToken(null);
            archive.setLeaseExpiresAt(null);
            archive.setLastError("Snapshot or R2 upload/verification failed. Source records were preserved.");
            archive.setCleanupEligible(false);
            attendanceArchiveRepository.save(archive);
        });
    }

    private Instant leaseExpiry() {
        return Instant.now().plus(Duration.ofMinutes(2));
    }
}
