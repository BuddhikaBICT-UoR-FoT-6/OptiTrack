package com.optitrack.repository;

import com.optitrack.model.entity.Role;
import com.optitrack.model.enums.RoleName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Purpose: Data access layer for Role entities.
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Finds a role by its enumerated name.
     * Used primarily during user registration or role assignment.
     * 
     * @param name The RoleName enum (e.g., ROLE_ADMIN)
     * @return Optional containing the Role if found
     */
    Optional<Role> findByName(RoleName name);
}
