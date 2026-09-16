package com.example.school.system.repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.ResultSmsNotification;
import com.example.school.system.types.SmsNotificationStatus;

public interface ResultSmsNotificationRepository extends JpaRepository<ResultSmsNotification, UUID> {
    @Modifying
    @Query("""
            UPDATE ResultSmsNotification notification
            SET notification.status = :sending,
                notification.attemptCount = notification.attemptCount + 1
            WHERE notification.id IN :ids
              AND notification.status = :pending
            """)
    int claimPending(@Param("ids") Collection<UUID> ids,
            @Param("pending") SmsNotificationStatus pending,
            @Param("sending") SmsNotificationStatus sending);

    List<ResultSmsNotification> findAllByIdInAndStatus(Collection<UUID> ids, SmsNotificationStatus status);

    boolean existsByStudentProfileIdAndAcademicYearAndCurrentSchoolTermAndExamType(
            UUID studentId, String academicYear, Integer term,
            com.example.school.system.types.ExamType examType);

    List<ResultSmsNotification> findAllByStudentProfileIdInAndAcademicYearAndCurrentSchoolTermAndExamType(
            Collection<UUID> studentIds, String academicYear, Integer term,
            com.example.school.system.types.ExamType examType);
}
