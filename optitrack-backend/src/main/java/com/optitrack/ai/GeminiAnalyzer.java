package com.optitrack.ai;

import com.optitrack.model.entity.TelemetryEvent;
import java.util.List;

/**
 * OptiTrack AI Engine
 * Purpose: Leverages Google Gemini to analyze fleet telemetry and generate 
 * actionable safety and efficiency insights.
 */
public interface GeminiAnalyzer {
    String analyzePerformance(List<TelemetryEvent> events);
    String generateSafetyReport(List<TelemetryEvent> events, String driverName);
}
