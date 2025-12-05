package com.optitrack.repository;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Purpose: Data access layer for the immutable telemetry event ledger.
 * The most performance-critical repository — queries here feed the Gemini AI
 * engine.
 *
 * Design Note: The composite index on (vehicle_id, recordedAt) defined in the
 * entity makes the time-range queries here extremely efficient at scale.
 */
@Repository
public interface TelemetryEventRepository extends JpaRepository<TelemetryEvent, Long> {

    /**
     * Core AI batch query: fetches all sensor events for a vehicle within a time
     * window.
     * Called by the scorecard service to build the prompt for Gemini.
     *
     * @param vehicle   The vehicle to query events for
     * @param startTime Start of the analysis window (e.g., start of day)
     * @param endTime   End of the analysis window (e.g., end of day)
     */
    List<TelemetryEvent> findByVehicleAndRecordedAtBetween(
            Vehicle vehicle,
            LocalDateTime startTime,
            LocalDateTime endTime);

    /**
     * Fetches all events for a specific driver — used for profile-level analysis.
     */
    List<TelemetryEvent> findByDriverProfileAndRecordedAtBetween(
            DriverProfile driverProfile,
            LocalDateTime startTime,
            LocalDateTime endTime);
}
