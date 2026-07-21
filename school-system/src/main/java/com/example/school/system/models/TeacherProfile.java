package com.example.school.system.models;

import java.util.List;
import java.util.UUID;
import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
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
@Table(name = "teachers_profile")
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class TeacherProfile {
    @Id
    @Column(columnDefinition = "BINARY(16)", name = "id")
    private UUID id;

    @Column(name = "first_name")
    @NotBlank(message = "First name is missing")
    private String firstName;

    @Column(name = "last_name")
    @NotBlank(message = "Last name is missing")
    private String lastName;

    // @Column(name = "available_connections")
    // private Integer connections = 6;
    @ManyToMany
    List<SubjectJoint> subjectJoints;

    @OneToOne
    @JoinColumn(name = "teacher_account")
    private Users teacher;

    @OneToOne
    @JoinColumn(name = "class_id")
    SchoolClass schoolClass;

    @PreUpdate
    private void normalize() {
        if (firstName != null) {
            firstName = firstName.trim().toLowerCase();
        }
        if (lastName != null) {
            lastName = lastName.trim().toLowerCase();
        }
    }

    @PrePersist
    private void generateIdAndNormalize() {
        if (id == null) {
            id = UuidCreator.getTimeOrdered();
        }
        if (firstName != null) {
            firstName = firstName.trim().toLowerCase();
        }
        if (lastName != null) {
            lastName = lastName.trim().toLowerCase();
        }
    }
}
