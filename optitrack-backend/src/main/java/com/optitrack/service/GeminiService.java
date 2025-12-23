package com.optitrack.service;

import com.optitrack.model.entity.TelemetryEvent;
import java.util.List;

public interface GeminiService {
    /**
     * Analyses a batch of telemetry events and generates professional 
     * driving recommendations using the Gemini AI.
     */
    String generateRecommendations(List<TelemetryEvent> events);
}
