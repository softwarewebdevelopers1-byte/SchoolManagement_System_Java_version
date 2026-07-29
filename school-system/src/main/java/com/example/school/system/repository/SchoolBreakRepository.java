package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.SchoolBreak;

public interface SchoolBreakRepository extends JpaRepository<SchoolBreak, UUID> {
    List<SchoolBreak> findAllBySchoolSettingsSchoolIdOrderByStartTimeAsc(UUID schoolId);
}
