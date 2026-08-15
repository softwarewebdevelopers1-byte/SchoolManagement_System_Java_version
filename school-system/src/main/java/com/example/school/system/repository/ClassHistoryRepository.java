package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.ClassHistory;

public interface ClassHistoryRepository extends JpaRepository<ClassHistory, UUID> {
    List<ClassHistory> findByLinkedClass(UUID linkedClass);

    List<ClassHistory> findBySchoolId(UUID schoolId);
}
