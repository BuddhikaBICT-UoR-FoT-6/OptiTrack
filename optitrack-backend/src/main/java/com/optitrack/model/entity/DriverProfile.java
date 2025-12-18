package com.optitrack.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Purpose: Extends a User account with fleet-operational data.
 */
@Entity
@Table(name = "driver_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    private Integer experienceYears;

    @Column(nullable = false)
    private Double averageScore;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", unique = true)
    private Vehicle assignedVehicle;

    @Column(nullable = false)
    @Builder.Default
    private Double totalHoursDriven = 0.0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
