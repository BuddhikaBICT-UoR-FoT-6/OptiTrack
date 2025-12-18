package com.optitrack.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Purpose: Immutable ledger record of a single IoT telemetry tick.
 */
@Entity
@Table(name = "telemetry_events", indexes = {
        @Index(name = "idx_vehicle_timestamp", columnList = "vehicle_id, recordedAt")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelemetryEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_profile_id", nullable = true) // Changed to nullable to allow GPS tracking without active assignment
    private DriverProfile driverProfile;

    @Column(nullable = false)
    private Double speedKph;

    @Column(nullable = false)
    private Double gpsLatitude;

    @Column(nullable = false)
    private Double gpsLongitude;

    @Column(nullable = false)
    private Double fuelLevel; // Added fuel level support

    @Column(nullable = false)
    @Builder.Default
    private Boolean isHarshBraking = false;

    @Column(length = 50)
    private String weatherCondition;

    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        if (this.recordedAt == null) {
            this.recordedAt = LocalDateTime.now();
        }
    }
}
