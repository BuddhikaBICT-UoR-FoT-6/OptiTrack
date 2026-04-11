package com.optitrack.controller;

import com.optitrack.model.entity.CashTransaction;
import com.optitrack.model.entity.Delivery;
import com.optitrack.model.dto.request.DeliveryRequest;
import com.optitrack.repository.CashTransactionRepository;
import com.optitrack.service.DeliveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/dispatcher")
@RequiredArgsConstructor
public class DispatcherController {

    private final DeliveryService deliveryService;
    private final CashTransactionRepository cashRepository;

    @GetMapping("/deliveries")
    public List<Delivery> getAllDeliveries() {
        return deliveryService.getAllDeliveries();
    }

    @PostMapping("/deliveries")
    public ResponseEntity<Delivery> createDelivery(@RequestBody DeliveryRequest delivery) {
        return ResponseEntity.ok(deliveryService.createDeliveryRequest(delivery));
    }

    @GetMapping("/cash")
    public List<CashTransaction> getCashRecords() {
        return cashRepository.findAll();
    }

    @PostMapping("/cash")
    public ResponseEntity<CashTransaction> recordTransaction(@RequestBody CashTransaction transaction) {
        transaction.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(cashRepository.save(transaction));
    }
}
