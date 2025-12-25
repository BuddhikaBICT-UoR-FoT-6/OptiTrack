package com.optitrack.controller;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;

    @PostMapping("/record")
    public ResponseEntity<TelemetryEvent> recordEvent(@RequestBody TelemetryEvent event) {
        return ResponseEntity.ok(telemetryService.recordEvent(event));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<TelemetryEvent>> getVehicleTelemetry(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(telemetryService.getEventsByVehicle(vehicleId));
    }

    @GetMapping("/latest/{vehicleId}")
    public ResponseEntity<TelemetryEvent> getLatestTelemetry(@PathVariable Long vehicleId) {
        return telemetryService.getLatestEvent(vehicleId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Fetches the most recent incidents (Harsh Braking) across the entire fleet.
     * Used by the Alert Engine for real-time notifications.
     */
    @GetMapping("/incidents/recent")
    public ResponseEntity<List<TelemetryEvent>> getRecentIncidents() {
        return ResponseEntity.ok(telemetryService.getRecentIncidents());
    }
}
