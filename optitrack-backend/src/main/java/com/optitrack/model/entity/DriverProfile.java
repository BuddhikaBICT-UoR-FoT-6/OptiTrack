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
 * Decouples driver-specific fields (license, assigned vehicle)
 * from the core identity (username, password) in the User entity.
 *
 * Design Note: One-to-One with User ensures every driver account
 * has exactly one operational profile. One-to-One with Vehicle
 * enforces the business rule that a vehicle can only have one
 * active driver at a time.
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

    // One driver profile belongs to exactly one User account
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // A driver is assigned to one vehicle at a time (nullable = unassigned)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", unique = true)
    private Vehicle assignedVehicle;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String licenseNumber;

    @Column(nullable = false)
    @Builder.Default
    private Double totalHoursDriven = 0.0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
