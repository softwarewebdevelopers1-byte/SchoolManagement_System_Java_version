package com.example.school.system.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.TeachingPeriod;

public interface TeachingPeriodRepository extends JpaRepository<TeachingPeriod, UUID> {
    List<TeachingPeriod> findAllBySchoolIdOrderByPeriodNumberAsc(UUID schoolId);

    void deleteBySchoolId(UUID schoolId);
}
