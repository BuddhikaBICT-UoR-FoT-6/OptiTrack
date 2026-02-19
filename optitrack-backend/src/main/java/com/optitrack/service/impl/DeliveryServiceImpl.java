package com.optitrack.service.impl;

import com.optitrack.model.entity.Delivery;
import com.optitrack.model.enums.DeliveryStatus;
import com.optitrack.model.enums.PaymentMethod;
import com.optitrack.repository.DeliveryRepository;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final TelemetryEventRepository telemetryRepository;

    @Override
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @Override
    public Optional<Delivery> getDeliveryById(Long id) {
        return deliveryRepository.findById(id);
    }

    @Override
    public List<Delivery> getDeliveriesByVehicle(Long vehicleId) {
        return deliveryRepository.findByVehicleId(vehicleId);
    }

    @Override
    public List<Delivery> getDeliveriesByCustomer(Long customerId) {
        // Assuming we add findByCustomerId to repo
        return deliveryRepository.findAll().stream()
                .filter(d -> d.getCustomer() != null && d.getCustomer().getId().equals(customerId))
                .toList();
    }

    @Override
    @Transactional
    public Delivery createDeliveryRequest(Delivery delivery) {
        delivery.setStatus(DeliveryStatus.PENDING);
        delivery.setAssignedAt(LocalDateTime.now());
        // Mock QR data generation
        delivery.setQrCodeData("QR-" + System.currentTimeMillis());
        delivery.setOtp(String.format("%06d", (int)(Math.random() * 1000000)));
        return deliveryRepository.save(delivery);
    }

    @Override
    @Transactional
    public Delivery updateDeliveryStatus(Long id, String status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        delivery.setStatus(DeliveryStatus.valueOf(status));
        if (DeliveryStatus.DELIVERED.name().equals(status)) {
            delivery.setIsDelivered(true);
            delivery.setDeliveredAt(LocalDateTime.now());
        }
        return deliveryRepository.save(delivery);
    }

    @Override
    public boolean validateDelivery(Long id, String qrData, double lat, double lon) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        // 1. QR Validation
        if (!delivery.getQrCodeData().equals(qrData)) {
            log.warn("❌ [OPTI-LOGISTICS] QR Mismatch for delivery {}", id);
            return false;
        }

        // 2. Proximity Check (within 200m)
        double distance = calculateDistance(lat, lon, delivery.getDestinationLat(), delivery.getDestinationLon());
        if (distance > 0.2) { // 0.2 km = 200m
            log.warn("❌ [OPTI-LOGISTICS] Proximity Check Failed for delivery {}. Distance: {} km", id, distance);
            return false;
        }

        log.info("✅ [OPTI-LOGISTICS] Delivery {} validated successfully.", id);
        return true;
    }

    @Override
    @Transactional
    public void processPayment(Long id, String method, double amount) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        delivery.setPaymentMethod(PaymentMethod.valueOf(method));
        if (delivery.getStatus() == DeliveryStatus.PENDING) {
            delivery.setAdvancePayment(amount);
            delivery.setStatus(DeliveryStatus.PAID_ADVANCE);
        } else {
            delivery.setTotalPayment(delivery.getTotalPayment() + amount);
            if (delivery.getTotalPayment() >= 100.0) { // Mock logic for full payment
                delivery.setStatus(DeliveryStatus.DELIVERED);
            }
        }
        deliveryRepository.save(delivery);
    }

    @Override
    @Transactional
    public void cancelDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        
        delivery.setStatus(DeliveryStatus.CANCELLED);
        delivery.setCancellationFee(250.0); // Mock fee
        // Refund logic would go here
        deliveryRepository.save(delivery);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = Math.toDegrees(dist);
        dist = dist * 60 * 1.1515 * 1.609344;
        return dist;
    }
}
