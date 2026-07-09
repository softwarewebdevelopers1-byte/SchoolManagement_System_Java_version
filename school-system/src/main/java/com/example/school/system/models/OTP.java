package com.example.school.system.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "otp_verifications")
public class OTP {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String email;

    private boolean used = false;

    @Column(name = "otp_values")
    String value;

    private LocalDateTime expirationTime;

    @PrePersist
    private void setExpiration() {
        if (expirationTime == null) {
            expirationTime = LocalDateTime.now().plusMinutes(5);
        }
    }
}
