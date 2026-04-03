package com.optitrack.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.optitrack.model.enums.VehicleStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Purpose: Represents a physical vehicle asset in the OptiTrack fleet.
 */
@Entity
@Table(name = "vehicles", uniqueConstraints = {
        @UniqueConstraint(columnNames = "licensePlate")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "assignedDriver")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 20)
    @Column(nullable = false, unique = true)
    private String licensePlate;

    @NotBlank
    @Size(max = 50)
    private String make; 

    @NotBlank
    @Size(max = 50)
    private String model;

    @Column(nullable = false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.INACTIVE;

    @OneToOne(mappedBy = "assignedVehicle")
    @JsonIgnore
    private DriverProfile assignedDriver;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder.Default
    private Boolean maintenanceDue = false;

    private LocalDateTime lastMaintenanceAt;
}
