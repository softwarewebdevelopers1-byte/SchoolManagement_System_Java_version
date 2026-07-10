package com.example.school.system.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.school.system.models.InviteLinks;

public interface TokenRepository extends JpaRepository<InviteLinks, Long> {
    Optional<InviteLinks> findByToken(String token);
}
