package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.repository.DeliveryRepository;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Purpose: Simulates real-time IoT telemetry from the entire fleet.
 * Mimics ESP32 data streaming with persistent movement across Sri Lanka.
 * Hardened against legacy "New York" coordinates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TelemetrySimulationService {

    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final DeliveryRepository deliveryRepository;
    private final TelemetryEventRepository telemetryRepository;
    private final Random random = new Random();
    private final Map<Long, double[]> vehicleLocations = new HashMap<>();

    // Sri Lanka Bounds approx: Lat [6.0, 9.5], Lon [79.7, 81.8]
    private static final double MIN_LAT = 6.0;
    private static final double MAX_LAT = 9.5;
    private static final double MIN_LON = 79.7;
    private static final double MAX_LON = 81.8;

    @Scheduled(fixedRate = 6000)
    public void simulateFleetActivity() {
        triggerSimulation();
    }

    @org.springframework.transaction.annotation.Transactional
    public void triggerSimulation() {
        List<Vehicle> allVehicles = vehicleRepository.findAll();
        List<DriverProfile> allDrivers = driverProfileRepository.findAll();
        
        if (allVehicles.isEmpty()) return;

        for (Vehicle vehicle : allVehicles) {
            DriverProfile driver = allDrivers.stream()
                    .filter(dr -> dr.getAssignedVehicle() != null && dr.getAssignedVehicle().getId().equals(vehicle.getId()))
                    .findFirst()
                    .orElse(null);

            // 1. Initial Placement
            double[] currentPos = vehicleLocations.get(vehicle.getId());
            if (currentPos == null) {
                currentPos = new double[]{
                    MIN_LAT + random.nextDouble() * (MAX_LAT - MIN_LAT),
                    MIN_LON + random.nextDouble() * (MAX_LON - MIN_LON)
                };
                vehicleLocations.put(vehicle.getId(), currentPos);
            }

            // 2. Mission-Driven Movement (Towards Delivery Target)
            var activeDelivery = deliveryRepository.findAll().stream()
                    .filter(d -> d.getVehicle() != null && d.getVehicle().getId().equals(vehicle.getId()) && !d.getIsDelivered())
                    .findFirst()
                    .orElse(null);

            double targetLat, targetLon;
            if (activeDelivery != null && activeDelivery.getDestinationLat() != null) {
                targetLat = activeDelivery.getDestinationLat();
                targetLon = activeDelivery.getDestinationLon();
            } else {
                // Return to Hub (Colombo default) if no active delivery
                targetLat = 6.9271;
                targetLon = 79.8612;
            }

            // Calculate Vector to Target
            double deltaLat = targetLat - currentPos[0];
            double deltaLon = targetLon - currentPos[1];
            double distance = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);

            // Move at practical speed (approx 40-70 km/h in coordinate units)
            double moveStep = 0.0015; // Speed calibration for ground logistics
            if (distance > moveStep) {
                currentPos[0] += (deltaLat / distance) * moveStep;
                currentPos[1] += (deltaLon / distance) * moveStep;
            }

            // 3. Operational Metrics
            double speed = (distance > moveStep) ? (45 + random.nextDouble() * 25) : 0;
            boolean isHarshBraking = random.nextDouble() < 0.02;

            TelemetryEvent event = TelemetryEvent.builder()
                    .vehicle(vehicle)
                    .driverProfile(driver)
                    .gpsLatitude(currentPos[0])
                    .gpsLongitude(currentPos[1])
                    .speedKph(speed)
                    .fuelLevel(20 + random.nextDouble() * 80)
                    .engineTemp(85 + random.nextDouble() * 10)
                    .vibrationLevel(random.nextDouble() * 3)
                    .isHarshBraking(isHarshBraking)
                    .recordedAt(LocalDateTime.now())
                    .build();

            telemetryRepository.save(event);
        }
    }

    private boolean isWithinSriLanka(double lat, double lon) {
        return lat >= 5.5 && lat <= 10.0 && lon >= 79.0 && lon <= 82.5;
    }
}
