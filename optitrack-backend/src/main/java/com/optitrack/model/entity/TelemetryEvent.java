package com.optitrack.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Purpose: Immutable ledger record of a single IoT telemetry tick.
 * Generated every N seconds by the Spring @Scheduled simulator.
 * This entity is never updated — only inserted and read.
 *
 * Design Note: No @UpdateTimestamp — telemetry is an append-only log.
 * The AI scorecard service queries this table in bulk to analyse
 * a driver's behaviour over a time window.
 */
@Entity
@Table(name = "telemetry_events", indexes = {
        // Composite index for the most common query: fetch events by vehicle within a
        // time range
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
    @JoinColumn(name = "driver_profile_id", nullable = false)
    private DriverProfile driverProfile;

    @Column(nullable = false)
    private Double speedKph; // Current speed in km/h

    @Column(nullable = false)
    private Double gpsLatitude;

    @Column(nullable = false)
    private Double gpsLongitude;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isHarshBraking = false;

    @Column(length = 50)
    private String weatherCondition; // e.g., "RAIN", "FOG", "CLEAR"

    // Timestamp is set at creation — not managed by Hibernate to keep it pure
    @Column(nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @PrePersist
    protected void onCreate() {
        // Ensures timestamp is always set before the record is inserted
        this.recordedAt = LocalDateTime.now();
    }
}
