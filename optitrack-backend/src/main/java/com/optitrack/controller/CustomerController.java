package com.optitrack.controller;

import com.optitrack.model.entity.Delivery;
import com.optitrack.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CustomerController {

    private final DeliveryService deliveryService;

    @GetMapping("/deliveries/{customerId}")
    public List<Delivery> getMyDeliveries(@PathVariable Long customerId) {
        return deliveryService.getDeliveriesByCustomer(customerId);
    }

    @PostMapping("/request")
    public ResponseEntity<Delivery> requestDelivery(@RequestBody Delivery delivery) {
        return ResponseEntity.ok(deliveryService.createDeliveryRequest(delivery));
    }

    @PostMapping("/{id}/pay-advance")
    public ResponseEntity<Void> payAdvance(@PathVariable Long id, @RequestParam double amount) {
        deliveryService.processPayment(id, "ONLINE_QR", amount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelRequest(@PathVariable Long id) {
        deliveryService.cancelDelivery(id);
        return ResponseEntity.ok().build();
    }
}
