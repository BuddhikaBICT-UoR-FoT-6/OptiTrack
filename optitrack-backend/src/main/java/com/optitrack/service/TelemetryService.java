package com.optitrack.service;

import com.optitrack.model.entity.TelemetryEvent;
import java.util.List;
import java.util.Optional;

public interface TelemetryService {
    TelemetryEvent recordEvent(TelemetryEvent event);

    List<TelemetryEvent> getEventsByVehicle(Long vehicleId);

    List<TelemetryEvent> getLatestEvents();

    Optional<TelemetryEvent> getLatestEvent(Long vehicleId);
}
