package com.optitrack.service;

import com.optitrack.model.entity.Delivery;
import java.util.List;
import java.util.Optional;

public interface DeliveryService {
    List<Delivery> getAllDeliveries();
    Optional<Delivery> getDeliveryById(Long id);
    List<Delivery> getDeliveriesByVehicle(Long vehicleId);
    List<Delivery> getDeliveriesByCustomer(Long customerId);
    
    Delivery createDeliveryRequest(Delivery delivery);
    Delivery updateDeliveryStatus(Long id, String status);
    
    boolean validateDelivery(Long id, String qrData, double lat, double lon);
    void submitRating(Long id, Double rating, String feedback);
    void submitSignature(Long id, String signatureBase64);
    void processPayment(Long id, String method, double amount);
    void cancelDelivery(Long id);
}
