package com.example.school.system.models;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.BatchSize;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "expiry_links")
@BatchSize(size = 50)
public class ExpiryLinks {
    @Id
    @Column(nullable = false, updatable = false, columnDefinition = "BINARY(16)")
    UUID id;

    @Column(name = "token")
    String token;

    @Column(name = "used")
    boolean used = false;

    @Column(name = "expiration")
    LocalDateTime expirationTime;

    @Column(name = "users_id")
    UUID users;

    @PrePersist
    private void generateId() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
    }
}

