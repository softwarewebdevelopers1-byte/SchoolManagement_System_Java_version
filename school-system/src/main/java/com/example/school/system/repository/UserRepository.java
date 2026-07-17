package com.example.school.system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.school.system.models.Users;
import com.example.school.system.types.AccountStatus;
import com.example.school.system.types.UserRoles;

public interface UserRepository extends JpaRepository<Users, UUID> {
        boolean existsByEmail(String email);

        boolean existsByEmailAndStatus(String email, AccountStatus status);

        Optional<Users> findByEmail(String email);

        Optional<Users> findByEmailAndStatus(String email, String status);

        Optional<Users> findByIdAndEmail(UUID id, String email);

        List<Users> findAllBySchool(UUID id);

        @Query("""
                            SELECT u
                            FROM Users u
                            WHERE u.school.id = :schoolId
                              AND :role NOT MEMBER OF u.roles
                        """)
        List<Users> findUsersBySchoolWithoutRole(
                        @Param("schoolId") UUID schoolId,
                        @Param("role") UserRoles role);
}

