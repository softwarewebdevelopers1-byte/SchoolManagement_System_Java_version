package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.MarksRow;

public interface MarksRepo extends JpaRepository<MarksRow, UUID> {
        @Query("""
                        SELECT m FROM MarksRow m WHERE m.StudentProfile.id = :studentId
                        AND m.marksSheet.id = :marksSheetId

                                    """)
        Optional<MarksRow> findByStudentProfileIdAndMarksSheetId(
                        @Param("studentId") UUID studentProfileId, @Param("marksSheetId") UUID marksSheetId);

        List<MarksRow> findAllByMarksSheetId(UUID sheetId);
}


