package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.MarksRow;

public interface MarksRepo extends JpaRepository<MarksRow, UUID> {
        @Query("""
                        SELECT m FROM MarksRow m WHERE m.StudentProfile.id = :studentId
                        AND m.marksSheet.id = :marksSheetId

                                    """)
        @EntityGraph(attributePaths = { "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        Optional<MarksRow> findByStudentProfileIdAndMarksSheetId(
                        @Param("studentId") UUID studentProfileId, @Param("marksSheetId") UUID marksSheetId);

        @EntityGraph(attributePaths = { "studentProfile", "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        List<MarksRow> findAllByMarksSheetId(UUID sheetId);

        @EntityGraph(attributePaths = { "marksSheet", "marksSheet.subjectJoint", "marksSheet.subjectJoint.schoolClass", "marksSheet.subjectJoint.subject" })
        List<MarksRow> findByStudentProfileId(UUID studentProfileId);
}


