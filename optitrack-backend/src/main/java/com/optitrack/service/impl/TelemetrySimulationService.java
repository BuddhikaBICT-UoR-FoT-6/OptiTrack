package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.repository.TelemetryEventRepository;
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

    private final DriverProfileRepository driverProfileRepository;
    private final TelemetryEventRepository telemetryRepository;
    private final Random random = new Random();

    private static final double BASE_LAT = 7.8731;
    private static final double BASE_LON = 80.7718;

    @Scheduled(fixedRate = 5000)
    public void simulateFleetActivity() {
        log.info("🔥 [OPTI-SIM] Ignition! Heartbeat cycle starting...");
        triggerSimulation();
    }

    @org.springframework.transaction.annotation.Transactional
    public void triggerSimulation() {
        List<DriverProfile> activeDrivers = driverProfileRepository.findAll();
        if (activeDrivers.isEmpty()) {
            log.warn("⚠️ [OPTI-SIM] No active driver assignments found for simulation!");
            return;
        }

        for (DriverProfile driver : activeDrivers) {
            Vehicle vehicle = driver.getAssignedVehicle();
            if (vehicle == null) continue;

            // 1. Simulate Movement & Random Incidents
            double latOffset = (random.nextDouble() - 0.5) * 0.005;
            double lonOffset = (random.nextDouble() - 0.5) * 0.005;
            
            double speed = 40 + random.nextDouble() * 60;
            boolean isHarshBraking = random.nextDouble() < 0.1; // 10% chance
            if (isHarshBraking) speed = 5.0; // Sudden stop simulation

            // 2. Simulate Fuel Consumption
            double fuel = 15 + random.nextDouble() * 85; 
            
            // 3. Simulate Engine Temperature (70-95°C normal, can spike to 110 under stress)
            double engineTemp = 70 + (speed / 100) * 20 + random.nextDouble() * 10;
            
            // 4. Simulate Vibration (0-10 scale, higher at extreme speeds or harsh braking)
            double vibration = (speed / 100) * 5 + (isHarshBraking ? 8 : 0) + random.nextDouble() * 2;
            vibration = Math.min(10.0, vibration); // Cap at 10

            TelemetryEvent event = TelemetryEvent.builder()
                    .vehicle(vehicle)
                    .driverProfile(driver)
                    .gpsLatitude(BASE_LAT + latOffset)
                    .gpsLongitude(BASE_LON + lonOffset)
                    .speedKph(speed)
                    .fuelLevel(fuel)
                    .engineTemp(engineTemp)
                    .vibrationLevel(vibration)
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
