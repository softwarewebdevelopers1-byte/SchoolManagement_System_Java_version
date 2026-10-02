package com.example.school.system.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "public_school_creation_quotas")
@Getter
@Setter
@NoArgsConstructor
public class PublicSchoolCreationQuota {
    @Id
    @Column(name = "device_key", length = 64, nullable = false)
    private String deviceKey;

    @Column(name = "schools_created", nullable = false)
    private int schoolsCreated;
}
