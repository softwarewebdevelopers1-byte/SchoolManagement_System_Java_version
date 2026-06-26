package com.example.school.system.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.school.system.models.SchoolSettings;

public interface SchoolSettingsRepository extends JpaRepository<SchoolSettings,Integer> {
}
