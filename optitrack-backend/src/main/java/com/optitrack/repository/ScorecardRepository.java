package com.optitrack.repository;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.Scorecard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Purpose: Data access layer for AI-generated Scorecard entities.
 */
@Repository
public interface ScorecardRepository extends JpaRepository<Scorecard, Long> {

    /**
     * Fetches a driver's scorecard for a specific date.
     * Used to prevent duplicate scorecard generation and for dashboard display.
     */
    Optional<Scorecard> findByDriverProfileAndPeriodDate(
            DriverProfile driverProfile,
            LocalDate periodDate);

    /**
     * Retrieves the full scorecard history for a driver — for analytics display.
     */
    List<Scorecard> findByDriverProfileOrderByPeriodDateDesc(DriverProfile driverProfile);

    List<Scorecard> findByDriverProfileIdOrderByGeneratedAtDesc(Long driverId);

    Optional<Scorecard> findFirstByDriverProfileIdOrderByGeneratedAtDesc(Long driverId);
}
