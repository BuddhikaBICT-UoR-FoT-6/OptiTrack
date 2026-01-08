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
    private final com.optitrack.service.impl.TelemetrySimulationService simulationService;

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
     * Force Pulse: Manually triggers a simulation heartbeat.
     */
    @PostMapping("/simulation/force-pulse")
    public ResponseEntity<String> forcePulse() {
        simulationService.triggerSimulation();
        return ResponseEntity.ok("🔥 [OPTI-SIM] Manual heartbeat pulse successful!");
    }

    /**
     * Fetches the most recent incidents (Harsh Braking) across the entire fleet.
     * Used by the Alert Engine for real-time notifications.
     */
    @GetMapping("/incidents/recent")
    public ResponseEntity<List<TelemetryEvent>> getRecentIncidents() {
        return ResponseEntity.ok(telemetryService.getRecentIncidents());
    }

    /**
     * System Health Check: Returns counts of all core entities.
     */
    @GetMapping("/system/status")
    public ResponseEntity<java.util.Map<String, Long>> getSystemStatus() {
        java.util.Map<String, Long> status = new java.util.HashMap<>();
        status.put("vehicles", telemetryService.getVehicleCount());
        status.put("drivers", telemetryService.getDriverCount());
        status.put("scorecards", telemetryService.getScorecardCount());
        status.put("telemetryEvents", telemetryService.getEventCount());
        return ResponseEntity.ok(status);
    }
}
