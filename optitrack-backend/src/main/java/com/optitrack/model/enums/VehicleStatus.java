package com.optitrack.model.enums;

/**
 * Purpose: Defines the operational lifecycle states of a vehicle in the fleet.
 * Used by the dashboard to filter and display vehicle availability.
 */
public enum VehicleStatus {
    ACTIVE, // Vehicle is assigned and on the road
    INACTIVE, // Vehicle is available but not assigned
    MAINTENANCE // Vehicle is off-road for servicing
}
