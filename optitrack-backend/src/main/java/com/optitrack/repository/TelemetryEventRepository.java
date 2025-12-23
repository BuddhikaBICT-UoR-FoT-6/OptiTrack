package com.optitrack.repository;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Purpose: Data access layer for the immutable telemetry event ledger.
 */
@Repository
public interface TelemetryEventRepository extends JpaRepository<TelemetryEvent, Long> {

    List<TelemetryEvent> findByVehicleAndRecordedAtBetween(
            Vehicle vehicle,
            LocalDateTime startTime,
            LocalDateTime endTime);

    List<TelemetryEvent> findByDriverProfileAndRecordedAtBetween(
            DriverProfile driverProfile,
            LocalDateTime startTime,
            LocalDateTime endTime);

    List<TelemetryEvent> findByVehicleIdOrderByRecordedAtDesc(Long vehicleId);

    Optional<TelemetryEvent> findFirstByVehicleIdOrderByRecordedAtDesc(Long vehicleId);

    /**
     * Fetches telemetry events for a specific driver, ordered by most recent first.
     * Essential for AI performance analysis.
     */
    List<TelemetryEvent> findByDriverProfileIdOrderByRecordedAtDesc(Long driverId);
}
