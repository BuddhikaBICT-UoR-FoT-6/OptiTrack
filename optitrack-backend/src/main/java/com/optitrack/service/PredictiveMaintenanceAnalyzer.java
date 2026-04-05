package com.optitrack.service;

import com.optitrack.model.entity.TelemetryEvent;
import java.util.List;
import java.util.Map;

/**
 * Analyzes telemetry patterns to predict maintenance probability.
 * Uses engine temperature, vibration, and harsh braking patterns.
 */
public interface PredictiveMaintenanceAnalyzer {
    
    /**
     * Calculates maintenance probability (0-100%) for a vehicle
     */
    double calculateMaintenanceProbability(Long vehicleId);
    
    /**
     * Gets detailed maintenance risk factors
     */
    Map<String, Object> getMaintenanceInsights(Long vehicleId);
    
    /**
     * Analyzes a single telemetry event for anomalies
     */
    MaintenanceAlert analyzeForAnomalies(TelemetryEvent event);
    
    // DTO for maintenance alert
    record MaintenanceAlert(
        Long vehicleId,
        double maintenanceProbability,
        String riskLevel, // LOW, MEDIUM, HIGH, CRITICAL
        String primaryCause,
        List<String> recommendations
    ) {}
}
