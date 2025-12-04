package com.optitrack.repository;

import com.optitrack.model.entity.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Purpose: Data access layer for DriverProfile entities.
 * Links operational driver data back to the core User identity.
 */
@Repository
public interface DriverProfileRepository extends JpaRepository<DriverProfile, Long> {

    /** Used for admin lookups and validation of license uniqueness. */
    Optional<DriverProfile> findByLicenseNumber(String licenseNumber);

    /**
     * Finds the operational profile belonging to a specific User account.
     * Critical path: used after JWT authentication to load the driver's context.
     */
    Optional<DriverProfile> findByUserId(Long userId);

    /** Checks if a license number is already registered. */
    Boolean existsByLicenseNumber(String licenseNumber);
}
