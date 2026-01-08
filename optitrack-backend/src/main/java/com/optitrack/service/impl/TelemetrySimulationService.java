package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

/**
 * Purpose: Simulates real-time IoT telemetry from the fleet.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetrySimulationService {

    private final VehicleRepository vehicleRepository;
    private final TelemetryEventRepository telemetryRepository;
    private final Random random = new Random();

    private static final double BASE_LAT = 40.7128;
    private static final double BASE_LON = -74.0060;

    @Scheduled(fixedRate = 5000)
    public void simulateFleetActivity() {
        log.info("🔥 [OPTI-SIM] Ignition! Heartbeat cycle starting...");
        triggerSimulation();
    }

    public void triggerSimulation() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.isEmpty()) {
            log.warn("⚠️ [OPTI-SIM] No vehicles found for simulation!");
            return;
        }

        for (Vehicle vehicle : vehicles) {
            // 1. Simulate Movement & Random Incidents
            double latOffset = (random.nextDouble() - 0.5) * 0.005;
            double lonOffset = (random.nextDouble() - 0.5) * 0.005;
            
            double speed = 40 + random.nextDouble() * 60;
            boolean isHarshBraking = random.nextDouble() < 0.1; // 10% chance
            if (isHarshBraking) speed = 5.0; // Sudden stop simulation

            // 2. Simulate Fuel Consumption
            double fuel = 15 + random.nextDouble() * 85; 

            TelemetryEvent event = TelemetryEvent.builder()
                    .vehicle(vehicle)
                    .gpsLatitude(BASE_LAT + latOffset)
                    .gpsLongitude(BASE_LON + lonOffset)
                    .speedKph(speed)
                    .fuelLevel(fuel)
                    .isHarshBraking(isHarshBraking)
                    .recordedAt(LocalDateTime.now())
                    .build();

            telemetryRepository.save(event);
            
            log.info("📡 HEARTBEAT: Telemetry recorded for unit {} | Speed: {} kph", vehicle.getLicensePlate(), String.format("%.1f", speed));

            if (isHarshBraking) {
                log.warn("⚠️ INCIDENT: Harsh Braking detected for unit {}", vehicle.getLicensePlate());
            }
        }
    }
}
