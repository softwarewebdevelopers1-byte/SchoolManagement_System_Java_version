package com.example.school.system.repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.school.system.models.AttendanceSheet;

public interface AttendanceSheetRepository extends JpaRepository<AttendanceSheet, UUID> {
    Optional<AttendanceSheet> findBySchoolClassClassIdAndDate(UUID classId, LocalDate date);

    @Query("""
            SELECT a FROM AttendanceSheet a WHERE id = :id AND schoolClass.classId= :classId AND a.status !=LOCKED
                """)
    Optional<AttendanceSheet> findEditableSheet(@Param("id") UUID sheetId, @Param("classId") UUID schoolClassClassId);
}
