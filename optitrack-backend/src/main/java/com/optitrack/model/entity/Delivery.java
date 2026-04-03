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

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status = DeliveryStatus.PENDING;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod;

    @Builder.Default
    private Double advancePayment = 0.0;
    
    @Builder.Default
    private Double totalPayment = 0.0;
    
    @Builder.Default
    private Double cancellationFee = 0.0;

    private String qrCodeData;
    private String otp;
    
    private String deliveryType;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDelivered = false;

    private Double destinationLat;
    private Double destinationLon;

    // AI & Merit Metrics
    private Double userRating;
    private String userFeedback;
    
    @Builder.Default
    private Boolean isNightDelivery = false;
    
    @Builder.Default
    private Boolean isWeatherChallenged = false;
    
    private Long assignmentToDeliveryMinutes;

    // Digital Document Vault (e-Waybills)
    private String waybillNumber;
    private String invoiceNumber;
    
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String customerSignature; // Base64 Signature Image

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
