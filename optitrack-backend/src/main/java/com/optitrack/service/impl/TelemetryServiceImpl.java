package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TelemetryServiceImpl implements TelemetryService {

    private final TelemetryEventRepository telemetryRepository;

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
}
