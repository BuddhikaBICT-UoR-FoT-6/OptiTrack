package com.optitrack.model.enums;

/**
 * Purpose: Defines the constant authority levels for system users.
 * Used for role-based access control (RBAC).
 */
public enum RoleName {
    ROLE_ADMIN, // Admin users can perform all actions
    ROLE_DISPATCHER, // Dispatcher users can perform dispatching actions
    ROLE_DRIVER // Driver users can perform driving actions
}
