package com.optitrack.service.impl;

import com.optitrack.model.entity.Delivery;
import com.optitrack.model.enums.DeliveryStatus;
import com.optitrack.model.enums.PaymentMethod;
import com.optitrack.model.dto.request.DeliveryRequest;
import com.optitrack.model.entity.User;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.repository.UserRepository;
import com.optitrack.repository.VehicleRepository;
import com.optitrack.repository.DeliveryRepository;
import com.optitrack.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

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
        return deliveryRepository.findByCustomerId(customerId);
    }

    @Override
    @Transactional
    public Delivery createDeliveryRequest(DeliveryRequest request) {
        Vehicle vehicle = null;
        if (request.getVehicle() != null && request.getVehicle().getId() != null) {
            vehicle = vehicleRepository.findById(request.getVehicle().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found: " + request.getVehicle().getId()));
        }

        User customer = null;
        if (request.getCustomer() != null && request.getCustomer().getId() != null) {
            customer = userRepository.findById(request.getCustomer().getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found: " + request.getCustomer().getId()));
        }

        Delivery delivery = Delivery.builder()
                .packageName(request.getPackageName())
                .ownerName(request.getOwnerName())
                .address(request.getAddress())
                .priority(request.getPriority())
                .deliveryType(request.getDeliveryType())
                .destinationLat(request.getDestinationLat())
                .destinationLon(request.getDestinationLon())
                .advancePayment(request.getAdvancePayment() != null ? request.getAdvancePayment() : 0.0)
                .totalPayment(request.getTotalPayment() != null ? request.getTotalPayment() : 0.0)
                .vehicle(vehicle)
                .customer(customer)
                .status(DeliveryStatus.PENDING)
                .assignedAt(LocalDateTime.now())
                .qrCodeData("QR-" + System.currentTimeMillis())
                .otp(String.format("%06d", (int)(Math.random() * 1000000)))
                .waybillNumber("WB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .invoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .build();

        return deliveryRepository.save(delivery);
    }

    @Override
    @Transactional
    public Delivery updateDeliveryStatus(Long id, String status) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found: " + id));
        delivery.setStatus(DeliveryStatus.valueOf(status));
        if (DeliveryStatus.DELIVERED.name().equals(status)) {
            delivery.setIsDelivered(true);
            delivery.setDeliveredAt(LocalDateTime.now());
            
            if (delivery.getAssignedAt() != null) {
                long minutes = ChronoUnit.MINUTES.between(delivery.getAssignedAt(), delivery.getDeliveredAt());
                delivery.setAssignmentToDeliveryMinutes(minutes);
            }
        }
        return deliveryRepository.save(delivery);
    }

    @Override
    public boolean validateDelivery(Long id, String qrData, double lat, double lon) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found: " + id));
        
        if (!delivery.getQrCodeData().equals(qrData)) {
            log.warn("❌ [OPTI-LOGISTICS] QR Mismatch for delivery {}", id);
            return false;
        }

        double distance = calculateDistance(lat, lon, delivery.getDestinationLat(), delivery.getDestinationLon());
        if (distance > 0.5) {
            log.warn("❌ [OPTI-LOGISTICS] Proximity Check Failed for delivery {}. Distance: {} km", id, distance);
            return false;
        }

        log.info("✅ [OPTI-LOGISTICS] Delivery {} validated successfully.", id);
        return true;
    }

    @Override
    @Transactional
    public void submitRating(Long id, Double rating, String feedback) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found: " + id));
        delivery.setUserRating(rating);
        delivery.setUserFeedback(feedback);
        deliveryRepository.save(delivery);
    }

    @Override
    @Transactional
    public void submitSignature(Long id, String signatureBase64) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found: " + id));
        delivery.setCustomerSignature(signatureBase64);
        
        // Finalize document numbers if not set
        if (delivery.getWaybillNumber() == null) {
            delivery.setWaybillNumber("WB-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        
        deliveryRepository.save(delivery);
        log.info("✍️ [OPTI-VAULT] E-Signature captured for delivery {}", id);
    }

    @Override
    @Transactional
    public void processPayment(Long id, String method, double amount) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found: " + id));
        
        delivery.setPaymentMethod(PaymentMethod.valueOf(method));
        if (delivery.getStatus() == DeliveryStatus.PENDING) {
            delivery.setAdvancePayment(amount);
            delivery.setStatus(DeliveryStatus.PAID_ADVANCE);
        } else {
            delivery.setTotalPayment(delivery.getTotalPayment() + amount);
            if (delivery.getTotalPayment() >= 100.0) {
                delivery.setStatus(DeliveryStatus.DELIVERED);
                delivery.setIsDelivered(true);
                delivery.setDeliveredAt(LocalDateTime.now());
            }
        }
        deliveryRepository.save(delivery);
    }

    @Override
    @Transactional
    public void cancelDelivery(Long id) {
        Delivery delivery = deliveryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Delivery not found: " + id));
        
        delivery.setStatus(DeliveryStatus.CANCELLED);
        delivery.setCancellationFee(250.0);
        deliveryRepository.save(delivery);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double theta = lon1 - lon2;
        double dist = Math.sin(Math.toRadians(lat1)) * Math.sin(Math.toRadians(lat2))
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) * Math.cos(Math.toRadians(theta));
        dist = Math.acos(dist);
        dist = dist * 60 * 1.1515 * 1.609344;
        return dist;
    }
}
