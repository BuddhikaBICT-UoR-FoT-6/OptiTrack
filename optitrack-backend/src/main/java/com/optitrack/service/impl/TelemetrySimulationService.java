package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
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
    private final TelemetryEventRepository telemetryRepository;
    private final Random random = new Random();

    private final Map<Long, double[]> vehicleLocations = new HashMap<>();

    // Sri Lanka Bounds approx: Lat [6.0, 9.5], Lon [79.7, 81.8]
    private static final double MIN_LAT = 6.0;
    private static final double MAX_LAT = 9.5;
    private static final double MIN_LON = 79.7;
    private static final double MAX_LON = 81.8;

    @Scheduled(fixedRate = 4000)
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

            // 1. HARD RESET: Ensure no vehicle is initialized outside SL (NY Correction)
            double[] currentPos = vehicleLocations.get(vehicle.getId());
            if (currentPos == null) {
                // Check latest in DB first
                TelemetryEvent latest = telemetryRepository.findFirstByVehicleIdOrderByRecordedAtDesc(vehicle.getId()).orElse(null);
                if (latest != null && isWithinSriLanka(latest.getGpsLatitude(), latest.getGpsLongitude())) {
                    currentPos = new double[]{latest.getGpsLatitude(), latest.getGpsLongitude()};
                } else {
                    // Random SL placement if legacy data is in NY or missing
                    currentPos = new double[]{
                        MIN_LAT + random.nextDouble() * (MAX_LAT - MIN_LAT),
                        MIN_LON + random.nextDouble() * (MAX_LON - MIN_LON)
                    };
                }
                vehicleLocations.put(vehicle.getId(), currentPos);
            }

            // 2. Persistent Movement
            double moveSpeed = 0.0005 + random.nextDouble() * 0.001; 
            double angle = random.nextDouble() * 2 * Math.PI; 
            
            currentPos[0] += moveSpeed * Math.cos(angle);
            currentPos[1] += moveSpeed * Math.sin(angle);

            // Strict Boundary Enforcement
            if (currentPos[0] < MIN_LAT || currentPos[0] > MAX_LAT) currentPos[0] = MIN_LAT + random.nextDouble() * (MAX_LAT - MIN_LAT);
            if (currentPos[1] < MIN_LON || currentPos[1] > MAX_LON) currentPos[1] = MIN_LON + random.nextDouble() * (MAX_LON - MIN_LON);

            // 3. Operational Metrics
            double speed = 30 + random.nextDouble() * 50;
            boolean isHarshBraking = random.nextDouble() < 0.03;

            TelemetryEvent event = TelemetryEvent.builder()
                    .vehicle(vehicle)
                    .driverProfile(driver)
                    .gpsLatitude(currentPos[0])
                    .gpsLongitude(currentPos[1])
                    .speedKph(speed)
                    .fuelLevel(20 + random.nextDouble() * 80)
                    .engineTemp(80 + random.nextDouble() * 15)
                    .vibrationLevel(random.nextDouble() * 5)
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
