package com.optitrack.model.entity;

import com.optitrack.model.enums.RoleName;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.NaturalId;

/**
 * Purpose: Represents a distinct authority level within the OptiTrack system
 * (e.g., ADMIN,
 * DRIVER).
 *
 * Design Note: Uses @NaturalId to ensure the 'name' field is unique and can be
 * used for efficient, business-key-based lookups, which is crucial for quick
 * security filter checks.
 */
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @NaturalId
    @Column(length = 60)
    private RoleName name;
}
