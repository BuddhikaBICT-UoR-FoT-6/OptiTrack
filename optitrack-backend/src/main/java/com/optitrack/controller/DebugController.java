package com.optitrack.controller;

import com.optitrack.service.impl.TelemetrySimulationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
@Profile("dev")
public class DebugController {

    private final TelemetrySimulationService simulationService;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    /**
     * Admin-only: manually trigger a simulation heartbeat.
     * Restricted to ROLE_ADMIN to prevent unauthorized simulation tampering.
     */
    @GetMapping("/force-pulse")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> forcePulse() {
        try {
            simulationService.triggerSimulation();
            return ResponseEntity.ok("Simulation pulse triggered.");
        } catch (Exception e) {
            // Log internally, never expose stack trace to client
            log.error("Debug force-pulse failed", e);
            return ResponseEntity.internalServerError().body("Simulation pulse failed. Check server logs.");
        }
    }
}
