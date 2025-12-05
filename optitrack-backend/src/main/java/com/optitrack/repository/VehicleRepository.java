package com.optitrack.repository;

import com.optitrack.model.entity.Vehicle;
import com.optitrack.model.enums.VehicleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Purpose: Data access layer for Vehicle entities.
 * Provides fleet filtering and lookup operations.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /** Fetches all vehicles matching a given operational status. */
    List<Vehicle> findByStatus(VehicleStatus status);

    /** Lookup by license plate — used for duplicate checks on registration. */
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    /** Checks if a license plate is already registered in the fleet. */
    Boolean existsByLicensePlate(String licensePlate);
}
