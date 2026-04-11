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
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import com.optitrack.model.entity.Delivery;

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

    // ConcurrentHashMap prevents race conditions between scheduled and debug-triggered runs
    private final Map<Long, double[]> vehicleLocations = new ConcurrentHashMap<>();

    // Cache vehicles list to avoid database hits on every tick (H4)
    private volatile List<Vehicle> cachedVehicles = java.util.Collections.emptyList();
    private long lastVehicleCacheRefreshTime = 0;
    private static final long VEHICLE_CACHE_TTL_MS = 30_000;

    // Sri Lanka geographic bounds
    private static final double MIN_LAT = 6.0;
    private static final double MAX_LAT = 9.5;
    private static final double MIN_LON = 79.7;
    private static final double MAX_LON = 81.8;

    // Default hub (Colombo) — fallback when vehicle has no active delivery
    private static final double HUB_LAT = 6.9271;
    private static final double HUB_LON = 79.8612;

    // Ground logistics speed step per tick (~45-70 km/h in coordinate units)
    private static final double MOVE_STEP = 0.0015;

    private List<Vehicle> getVehicles() {
        long now = System.currentTimeMillis();
        if (cachedVehicles.isEmpty() || (now - lastVehicleCacheRefreshTime > VEHICLE_CACHE_TTL_MS)) {
            synchronized (this) {
                if (cachedVehicles.isEmpty() || (now - lastVehicleCacheRefreshTime > VEHICLE_CACHE_TTL_MS)) {
                    cachedVehicles = vehicleRepository.findAll();
                    lastVehicleCacheRefreshTime = now;
                }
            }
        }
        return cachedVehicles;
    }

    @Scheduled(fixedRate = 6000)
    public void simulateFleetActivity() {
        triggerSimulation();
    }

    @org.springframework.transaction.annotation.Transactional
    public void triggerSimulation() {
        List<Vehicle> allVehicles = getVehicles();
        if (allVehicles.isEmpty()) return;

        List<DriverProfile> allDrivers = driverProfileRepository.findAll();

        // Pre-build a vehicleId → driver map to avoid O(V×D) linear search per vehicle
        Map<Long, DriverProfile> driverByVehicleId = allDrivers.stream()
                .filter(dr -> dr.getAssignedVehicle() != null)
                .collect(java.util.stream.Collectors.toMap(
                        dr -> dr.getAssignedVehicle().getId(),
                        dr -> dr,
                        (a, b) -> a // keep first if duplicate assignment
                ));

        // Fetch ALL active deliveries ONCE — eliminates N+1 (was findAll() per vehicle)
        Map<Long, Delivery> activeDeliveryByVehicleId = deliveryRepository.findByIsDelivered(false)
                .stream()
                .filter(d -> d.getVehicle() != null)
                .collect(java.util.stream.Collectors.toMap(
                        d -> d.getVehicle().getId(),
                        d -> d,
                        (a, b) -> a // keep first active delivery per vehicle
                ));

        List<TelemetryEvent> batch = new java.util.ArrayList<>(allVehicles.size());

        for (Vehicle vehicle : allVehicles) {
            DriverProfile driver = driverByVehicleId.get(vehicle.getId());

            // Initial Placement
            double[] currentPos = vehicleLocations.computeIfAbsent(vehicle.getId(), id -> new double[]{
                MIN_LAT + ThreadLocalRandom.current().nextDouble() * (MAX_LAT - MIN_LAT),
                MIN_LON + ThreadLocalRandom.current().nextDouble() * (MAX_LON - MIN_LON)
            });

            // Mission-Driven Movement (Towards Delivery Target)
            Delivery activeDelivery = activeDeliveryByVehicleId.get(vehicle.getId());
            double targetLat, targetLon;
            if (activeDelivery != null && activeDelivery.getDestinationLat() != null) {
                targetLat = activeDelivery.getDestinationLat();
                targetLon = activeDelivery.getDestinationLon();
            } else {
                // Return to Hub (Colombo default) if no active delivery
                targetLat = HUB_LAT;
                targetLon = HUB_LON;
            }

            double deltaLat = targetLat - currentPos[0];
            double deltaLon = targetLon - currentPos[1];
            double distance = Math.sqrt(deltaLat * deltaLat + deltaLon * deltaLon);

            if (distance > MOVE_STEP) {
                currentPos[0] += (deltaLat / distance) * MOVE_STEP;
                currentPos[1] += (deltaLon / distance) * MOVE_STEP;
            }

            double speed = (distance > MOVE_STEP)
                    ? (45 + ThreadLocalRandom.current().nextDouble() * 25)
                    : 0;
            boolean isHarshBraking = ThreadLocalRandom.current().nextDouble() < 0.02;

            batch.add(TelemetryEvent.builder()
                    .vehicle(vehicle)
                    .driverProfile(driver)
                    .gpsLatitude(currentPos[0])
                    .gpsLongitude(currentPos[1])
                    .speedKph(speed)
                    .fuelLevel(20 + ThreadLocalRandom.current().nextDouble() * 80)
                    .engineTemp(85 + ThreadLocalRandom.current().nextDouble() * 10)
                    .vibrationLevel(ThreadLocalRandom.current().nextDouble() * 3)
                    .isHarshBraking(isHarshBraking)
                    .recordedAt(LocalDateTime.now())
                    .build());
        }

        // Batch insert — replaces N individual save() calls per tick
        telemetryRepository.saveAll(batch);
    }
}
