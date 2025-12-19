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

    /**
     * Fetches all sensor events for a vehicle within a time window.
     */
    List<TelemetryEvent> findByVehicleAndRecordedAtBetween(
            Vehicle vehicle,
            LocalDateTime startTime,
            LocalDateTime endTime);

    /**
     * Fetches all events for a specific driver within a time window.
     */
    List<TelemetryEvent> findByDriverProfileAndRecordedAtBetween(
            DriverProfile driverProfile,
            LocalDateTime startTime,
            LocalDateTime endTime);

    /**
     * Fetches all telemetry events for a vehicle ID, ordered by the most recent first.
     */
    List<TelemetryEvent> findByVehicleIdOrderByRecordedAtDesc(Long vehicleId);

    /**
     * Fetches the absolute latest telemetry record for a vehicle ID.
     */
    Optional<TelemetryEvent> findFirstByVehicleIdOrderByRecordedAtDesc(Long vehicleId);
}
