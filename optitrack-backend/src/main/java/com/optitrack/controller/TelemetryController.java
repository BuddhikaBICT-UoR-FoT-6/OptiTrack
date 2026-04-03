package com.optitrack.controller;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.service.TelemetryService;
import com.optitrack.service.PredictiveMaintenanceAnalyzer;
import com.optitrack.service.DriverFatigueAnalyzer;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final com.optitrack.service.impl.TelemetrySimulationService simulationService;
    private final PredictiveMaintenanceAnalyzer maintenanceAnalyzer;
    private final DriverFatigueAnalyzer fatigueAnalyzer;

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
     * Supports both GET and POST for maximum flexibility during troubleshooting.
     */
    @RequestMapping(value = "/simulation/force-pulse", method = {RequestMethod.GET, RequestMethod.POST})
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
    public ResponseEntity<Map<String, Long>> getSystemStatus() {
        Map<String, Long> status = new java.util.HashMap<>();
        status.put("vehicles", telemetryService.getVehicleCount());
        status.put("drivers", telemetryService.getDriverCount());
        status.put("scorecards", telemetryService.getScorecardCount());
        status.put("telemetryEvents", telemetryService.getEventCount());
        return ResponseEntity.ok(status);
    }

    // ==================== AI ANALYZER ENDPOINTS ====================

    /**
     * Predictive Maintenance: Get maintenance probability for a vehicle
     */
    @GetMapping("/ai/maintenance/probability/{vehicleId}")
    public ResponseEntity<Map<String, Object>> getMaintenanceProbability(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceAnalyzer.getMaintenanceInsights(vehicleId));
    }

    /**
     * Predictive Maintenance: Get raw probability score
     */
    @GetMapping("/ai/maintenance/score/{vehicleId}")
    public ResponseEntity<Double> getMaintenanceScore(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(maintenanceAnalyzer.calculateMaintenanceProbability(vehicleId));
    }

    /**
     * Driver Fatigue: Get fatigue score for a driver
     */
    @GetMapping("/ai/fatigue/score/{driverId}")
    public ResponseEntity<Double> getFatigueScore(@PathVariable Long driverId) {
        return ResponseEntity.ok(fatigueAnalyzer.calculateFatigueScore(driverId));
    }

    /**
     * Driver Fatigue: Get detailed fatigue insights
     */
    @GetMapping("/ai/fatigue/insights/{driverId}")
    public ResponseEntity<Map<String, Object>> getFatigueInsights(@PathVariable Long driverId) {
        return ResponseEntity.ok(fatigueAnalyzer.getFatigueInsights(driverId));
    }

    /**
     * Driver Fatigue: Get latest dashcam analysis
     */
    @GetMapping("/ai/fatigue/dashcam/{driverId}")
    public ResponseEntity<DriverFatigueAnalyzer.DashcamAnalysis> getDashcamAnalysis(@PathVariable Long driverId) {
        return ResponseEntity.ok(fatigueAnalyzer.analyzeDashcamFrame(driverId));
    }

    /**
     * Driver Fatigue: Get recent fatigue alerts
     */
    @GetMapping("/ai/fatigue/alerts/{driverId}")
    public ResponseEntity<List<DriverFatigueAnalyzer.FatigueAlert>> getFatigueAlerts(@PathVariable Long driverId) {
        return ResponseEntity.ok(fatigueAnalyzer.getRecentFatigueAlerts(driverId));
    }
}
