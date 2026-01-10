package com.optitrack.controller;

import com.optitrack.service.impl.TelemetrySimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final TelemetrySimulationService simulationService;

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("🏓 [OPTI-DEBUG] Pong! Security is wide open for this route.");
    }

    @GetMapping("/force-pulse")
    public ResponseEntity<String> forcePulse() {
        simulationService.triggerSimulation();
        return ResponseEntity.ok("🔥 [OPTI-DEBUG] Debug pulse successful!");
    }
}
