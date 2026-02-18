package com.optitrack.model.entity;

import com.optitrack.model.enums.Priority;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "deliveries")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Delivery {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String packageName;

    @Column(nullable = false)
    private String ownerName;

    @Column(nullable = false)
    private String address;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    @Column(nullable = false)
    private Boolean isDelivered = false;

    private Double destinationLat;
    private Double destinationLon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;
}
