package com.optitrack.controller;

import com.optitrack.model.entity.Delivery;
import com.optitrack.repository.DeliveryRepository;
import com.optitrack.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;
    private final VehicleRepository vehicleRepository;

    @GetMapping
    public List<Delivery> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    @GetMapping("/vehicle/{vehicleId}")
    public List<Delivery> getDeliveriesByVehicle(@PathVariable Long vehicleId) {
        return deliveryRepository.findByVehicleId(vehicleId);
    }

    @PostMapping("/vehicle/{vehicleId}")
    public ResponseEntity<Delivery> addDelivery(@PathVariable Long vehicleId, @RequestBody Delivery delivery) {
        return vehicleRepository.findById(vehicleId).map(vehicle -> {
            delivery.setVehicle(vehicle);
            delivery.setAssignedAt(LocalDateTime.now());
            delivery.setIsDelivered(false);
            return ResponseEntity.ok(deliveryRepository.save(delivery));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<Delivery> completeDelivery(@PathVariable Long id) {
        return deliveryRepository.findById(id).map(delivery -> {
            delivery.setIsDelivered(true);
            delivery.setDeliveredAt(LocalDateTime.now());
            return ResponseEntity.ok(deliveryRepository.save(delivery));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long id) {
        if (deliveryRepository.existsById(id)) {
            deliveryRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
