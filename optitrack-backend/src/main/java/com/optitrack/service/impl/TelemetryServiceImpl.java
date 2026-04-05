package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.repository.VehicleRepository;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.repository.ScorecardRepository;
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
    private final VehicleRepository vehicleRepository;
    private final DriverProfileRepository driverRepository;
    private final ScorecardRepository scorecardRepository;

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
        LocalDateTime oneMinuteAgo = LocalDateTime.now().minusMinutes(1);
        return telemetryRepository.findAll().stream()
                .filter(e -> e.getIsHarshBraking() != null && e.getIsHarshBraking() && e.getRecordedAt().isAfter(oneMinuteAgo))
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

    @Override
    public List<TelemetryEvent> getLatestEvents(Long vehicleId, int limit) {
        List<TelemetryEvent> events = telemetryRepository.findByVehicleIdOrderByRecordedAtDesc(vehicleId);
        return events.size() > limit ? events.subList(0, limit) : events;
    }
}
