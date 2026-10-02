package com.example.school.system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.PublicSchoolCreationQuota;

import jakarta.persistence.LockModeType;

public interface PublicSchoolCreationQuotaRepository extends JpaRepository<PublicSchoolCreationQuota, String> {
    @Modifying
    @Query(value = """
            INSERT IGNORE INTO public_school_creation_quotas (device_key, schools_created)
            VALUES (:deviceKey, 0)
            """, nativeQuery = true)
    int createQuotaIfAbsent(@Param("deviceKey") String deviceKey);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT quota FROM PublicSchoolCreationQuota quota WHERE quota.deviceKey = :deviceKey")
    Optional<PublicSchoolCreationQuota> findByDeviceKeyForUpdate(@Param("deviceKey") String deviceKey);
}
