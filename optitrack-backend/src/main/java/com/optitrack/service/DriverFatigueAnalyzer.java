package com.optitrack.service;

import com.optitrack.model.entity.DriverProfile;
import java.util.List;
import java.util.Map;

/**
 * Analyzes driver behavior patterns to detect fatigue indicators.
 * Simulates dashcam AI analysis for:
 * - Eyes off road detection
 * - Yawning/fatigue indicators
 * - Attention level monitoring
 */
public interface DriverFatigueAnalyzer {
    
    /**
     * Calculates fatigue score (0-100) for a driver based on recent incidents
     */
    double calculateFatigueScore(Long driverId);
    
    /**
     * Gets detailed fatigue insights and dashcam analysis
     */
    Map<String, Object> getFatigueInsights(Long driverId);
    
    /**
     * Simulates a dashcam frame analysis
     */
    DashcamAnalysis analyzeDashcamFrame(Long driverId);
    
    /**
     * Gets recent fatigue alerts
     */
    List<FatigueAlert> getRecentFatigueAlerts(Long driverId);
    
    // DTO for dashcam analysis
    record DashcamAnalysis(
        Long driverId,
        String timestamp,
        boolean eyesDetected,
        boolean eyesOnRoad,
        boolean yawning,
        double attentionLevel, // 0-100
        String alert, // null, "EYES_OFF_ROAD", "YAWNING", "DISTRACTED"
        String recommendation
    ) {}
    
    // DTO for fatigue alert
    record FatigueAlert(
        Long driverId,
        String alertType, // "EYES_OFF_ROAD", "YAWNING", "DISTRACTED", "FATIGUE"
        String timestamp,
        String severity // "LOW", "MEDIUM", "HIGH"
    ) {}
}
