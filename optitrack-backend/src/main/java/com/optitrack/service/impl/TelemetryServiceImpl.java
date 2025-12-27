package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TelemetryServiceImpl implements TelemetryService {

    private final TelemetryEventRepository telemetryRepository;
    private final com.optitrack.repository.VehicleRepository vehicleRepository;
    private final com.optitrack.repository.DriverProfileRepository driverRepository;
    private final com.optitrack.repository.ScorecardRepository scorecardRepository;

    @Override
    public TelemetryEvent recordEvent(TelemetryEvent event) {
        return telemetryRepository.save(event);
    }

    @Override
    public List<TelemetryEvent> getEventsByVehicle(Long vehicleId) {
        return telemetryRepository.findByVehicleIdOrderByRecordedAtDesc(vehicleId);
    }

    @Override
    public List<TelemetryEvent> getLatestEvents() {
        return telemetryRepository.findAll();
    }

    @Override
    public Optional<TelemetryEvent> getLatestEvent(Long vehicleId) {
        return telemetryRepository.findFirstByVehicleIdOrderByRecordedAtDesc(vehicleId);
    }

    @Override
    public List<TelemetryEvent> getRecentIncidents() {
        // Return incidents from the last 1 minute (for polling)
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        return telemetryRepository.findAll().stream()
                .filter(e -> e.getIsHarshBraking() && e.getRecordedAt().isAfter(oneMinuteAgo))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public long getVehicleCount() { return vehicleRepository.count(); }
    @Override
    public long getDriverCount() { return driverRepository.count(); }
    @Override
    public long getScorecardCount() { return scorecardRepository.count(); }
    @Override
    public long getEventCount() { return telemetryRepository.count(); }
}
