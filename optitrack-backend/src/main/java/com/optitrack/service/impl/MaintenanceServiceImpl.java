package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.model.enums.VehicleStatus;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceServiceImpl {

    private final VehicleRepository vehicleRepository;
    private final TelemetryEventRepository telemetryRepository;

    /**
     * Automated Fleet Health Check.
     * Runs every 10 minutes to flag vehicles requiring maintenance.
     */
    @Scheduled(fixedRate = 600000)
    public void performHealthCheck() {
        log.info("🚀 Starting Automated Fleet Health Audit...");
        List<Vehicle> vehicles = vehicleRepository.findAll();

        for (Vehicle vehicle : vehicles) {
            // Logic: Flag for maintenance if > 5 harsh braking events in last 24h
            LocalDateTime oneDayAgo = LocalDateTime.now().minusDays(1);
            List<TelemetryEvent> recentEvents = telemetryRepository.findByVehicleIdOrderByRecordedAtDesc(vehicle.getId());
            
            long incidents = recentEvents.stream()
                    .filter(e -> e.getIsHarshBraking() && e.getRecordedAt().isAfter(oneDayAgo))
                    .count();

            if (incidents >= 3) {
                if (!vehicle.getMaintenanceDue()) {
                    vehicle.setMaintenanceDue(true);
                    vehicle.setStatus(VehicleStatus.MAINTENANCE);
                    vehicleRepository.save(vehicle);
                    log.warn("⚠️ AUTO-MAINTENANCE: Unit {} flagged due to {} safety incidents.", 
                            vehicle.getLicensePlate(), incidents);
                }
            }
        }
    }
}
