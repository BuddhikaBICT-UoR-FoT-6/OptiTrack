package com.optitrack.controller;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.service.PredictiveIntelligenceService;
import com.optitrack.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/predictive")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PredictiveController {

    private final PredictiveIntelligenceService predictiveService;
    private final TelemetryService telemetryService;

    @GetMapping("/insights/{vehicleId}")
    public Map<String, Object> getInsights(@PathVariable Long vehicleId) {
        List<TelemetryEvent> events = telemetryService.getLatestEvents(vehicleId, 5);
        return predictiveService.getPredictiveInsights(vehicleId, events);
    }
}
