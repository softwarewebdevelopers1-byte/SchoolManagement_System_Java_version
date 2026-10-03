package com.example.school.system.services.archive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.school.system.models.ResultArchive;
import com.example.school.system.repository.AttendanceArchiveRepository;
import com.example.school.system.repository.ResultArchiveRepository;
import com.example.school.system.repository.ResultArchiveStudentRepository;
import com.example.school.system.types.ArchiveStatus;

@ExtendWith(MockitoExtension.class)
class ArchiveJobStateServiceTest {
    @Mock private ResultArchiveRepository resultArchiveRepository;
    @Mock private AttendanceArchiveRepository attendanceArchiveRepository;
    @Mock private ResultArchiveStudentRepository resultArchiveStudentRepository;

    @Test
    void verifiedCorrectionActivatesNewVersionWithoutOverwritingPreviousVersion() {
        UUID previousId = UUID.randomUUID();
        UUID correctedId = UUID.randomUUID();
        UUID leaseToken = UUID.randomUUID();
        ResultArchive previous = new ResultArchive();
        previous.setId(previousId);
        previous.setSchoolId(UUID.randomUUID());
        previous.setVersion(1);
        previous.setStatus(ArchiveStatus.VERIFIED);
        previous.setDocumentKey("schools/s/results/a/v1/class-report.pdf");
        ResultArchive corrected = new ResultArchive();
        corrected.setId(correctedId);
        corrected.setSchoolId(previous.getSchoolId());
        corrected.setVersion(2);
        corrected.setStatus(ArchiveStatus.PROCESSING);
        corrected.setLeaseToken(leaseToken);
        corrected.setSupersedesArchiveId(previousId);
        when(resultArchiveRepository.findById(correctedId)).thenReturn(Optional.of(corrected));
        when(resultArchiveRepository.findById(previousId)).thenReturn(Optional.of(previous));

        ArchiveJobStateService service = new ArchiveJobStateService(
                resultArchiveRepository, attendanceArchiveRepository, resultArchiveStudentRepository);
        service.completeResult(
                correctedId,
                leaseToken,
                new R2ObjectStorage.StoredObject("manifest", "application/json", "manifest-hash", 20),
                new R2ObjectStorage.StoredObject("class-snapshot", "application/json", "snapshot-hash", 30),
                new R2ObjectStorage.StoredObject("class-pdf", "application/pdf", "pdf-hash", 40),
                List.of());

        assertEquals(ArchiveStatus.VERIFIED, corrected.getStatus());
        assertEquals(ArchiveStatus.SUPERSEDED, previous.getStatus());
        assertEquals("schools/s/results/a/v1/class-report.pdf", previous.getDocumentKey());
        verify(resultArchiveStudentRepository).deleteAllForArchive(correctedId);
        verify(resultArchiveRepository).save(corrected);
        verify(resultArchiveRepository).save(previous);
    }
}
