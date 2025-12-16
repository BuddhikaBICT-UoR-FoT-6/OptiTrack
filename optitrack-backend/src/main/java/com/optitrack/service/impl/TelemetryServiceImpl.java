package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TelemetryServiceImpl implements TelemetryService {

    private final TelemetryEventRepository telemetryRepository;

    @Override
    public TelemetryEvent recordEvent(TelemetryEvent event) {
        // Logic to process the event (e.g., check for speeding) can go here
        return telemetryRepository.save(event);
    }

    @Override
    public List<TelemetryEvent> getEventsByVehicle(Long vehicleId) {
        return telemetryRepository.findByVehicleIdOrderByRecordedAtDesc(vehicleId);
    }

    @Override
    public List<TelemetryEvent> getLatestEvents() {
        return telemetryRepository.findAll(); // In production, we'd limit this
    }
}
