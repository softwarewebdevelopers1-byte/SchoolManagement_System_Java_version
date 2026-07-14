package com.example.school.system.models;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import com.example.school.system.types.SchoolStatus;
import com.github.f4b6a3.uuid.UuidCreator;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "schools")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class School {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "id", updatable = false, nullable = false)
    private UUID schoolId;
    @Enumerated(EnumType.STRING)
    private SchoolStatus status;
    @Column(name = "school_name", unique = true)
    @NotBlank(message = "school name must be provided")
    private String schoolName;

    @Column(name = "code", unique = true)
    @NotBlank(message = "school code must be provided")
    private String schoolCode;

    @Column(name = "registered_date")
    @CreationTimestamp
    private LocalDate date;

    // creating relationship between school and user
    @OneToMany(mappedBy = "school", cascade = CascadeType.ALL)
    private List<Users>users;
    // creating relationship between school and school settings
    @OneToOne(mappedBy = "school", cascade = CascadeType.ALL)
    private SchoolSettings schoolSettings;

    @PreUpdate
    private void normalize() {
        if (schoolName != null) {
            schoolName = schoolName.trim().toLowerCase();
        }
        if (status == null) {
            status = SchoolStatus.PENDING_VERIFICATION;
        }
    }

    @PrePersist
    private void generateIdAndNormalize() {
        if (schoolId == null) {
            schoolId = UuidCreator.getTimeOrdered();
        }
        if (schoolName != null) {
            schoolName = schoolName.trim().toLowerCase();
        }
        if (status == null) {
            status = SchoolStatus.PENDING_VERIFICATION;
        }
    }

}