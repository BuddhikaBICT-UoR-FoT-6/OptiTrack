package com.optitrack.model.entity;

import com.optitrack.model.enums.DeliveryStatus;
import com.optitrack.model.enums.PaymentMethod;
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

    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    private Double advancePayment = 0.0;
    private Double totalPayment = 0.0;
    private Double cancellationFee = 0.0;

    private String qrCodeData;
    private String otp;
    
    // Delivery Type: "CENTER_TO_HOME" or "HOME_TO_LOCATION"
    private String deliveryType;

    @Column(nullable = false)
    private Boolean isDelivered = false;

    private Double destinationLat;
    private Double destinationLon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    private LocalDateTime assignedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime estimatedArrivalTime;
}
