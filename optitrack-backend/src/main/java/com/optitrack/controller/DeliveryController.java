package com.optitrack.controller;

import com.optitrack.model.entity.Delivery;
import com.optitrack.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryService deliveryService;

    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getDeliveryById(@PathVariable Long id) {
        return deliveryService.getDeliveryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<Delivery> getDeliveriesByVehicle(@PathVariable Long vehicleId) {
        return deliveryService.getDeliveriesByVehicle(vehicleId);
    }

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@RequestBody Delivery delivery) {
        return ResponseEntity.ok(deliveryService.createDeliveryRequest(delivery));
    }

    @PostMapping("/{id}/validate")
    public ResponseEntity<Boolean> validateDelivery(
            @PathVariable Long id, 
            @RequestParam String qrData, 
            @RequestParam double lat, 
            @RequestParam double lon) {
        return ResponseEntity.ok(deliveryService.validateDelivery(id, qrData, lat, lon));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Void> processPayment(
            @PathVariable Long id, 
            @RequestParam String method, 
            @RequestParam double amount) {
        deliveryService.processPayment(id, method, amount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelDelivery(@PathVariable Long id) {
        deliveryService.cancelDelivery(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<Void> submitRating(@PathVariable Long id, @RequestParam Double rating, @RequestParam String feedback) {
        deliveryService.submitRating(id, rating, feedback);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/signature")
    public ResponseEntity<Void> submitSignature(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        deliveryService.submitSignature(id, payload.get("signature"));
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Delivery> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(id, status));
    }
}
