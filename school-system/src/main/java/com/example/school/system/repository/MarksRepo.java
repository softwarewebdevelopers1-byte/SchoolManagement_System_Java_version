package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.Marks;

public interface MarksRepo extends JpaRepository<Marks, UUID> {
        @Query("""
                        SELECT m FROM Marks m WHERE m.StudentProfile.id = :studentId
                        AND m.marksSheet.id = :marksSheetId

                                    """)
        Optional<Marks> findByStudentProfileIdAndMarksSheetId(
                        @Param("studentId") UUID studentProfileId, @Param("marksSheetId") UUID marksSheetId);

        List<Marks> findAllByMarksSheetId(UUID sheetId);
}


