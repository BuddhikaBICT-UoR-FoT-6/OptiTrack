package com.optitrack.service.impl;

import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.PredictiveMaintenanceAnalyzer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Analyzes telemetry patterns to predict maintenance probability.
 * Considers:
 * - Elevated engine temperature trends
 * - High vibration levels
 * - Frequent harsh braking events
 * - Fuel consumption patterns
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PredictiveMaintenanceAnalyzerImpl implements PredictiveMaintenanceAnalyzer {

    private final TelemetryEventRepository telemetryRepository;

    @Override
    public double calculateMaintenanceProbability(Long vehicleId) {
        List<TelemetryEvent> recentEvents = telemetryRepository.findByVehicleIdOrderByRecordedAtDesc(
            vehicleId
        ).stream().limit(100).toList();

        if (recentEvents.isEmpty()) {
            return 0.0;
        }

        double score = 0.0;

        // 1. Engine Temperature Analysis (0-40 points)
        double avgTemp = recentEvents.stream()
            .mapToDouble(TelemetryEvent::getEngineTemp)
            .average()
            .orElse(70.0);
        double maxTemp = recentEvents.stream()
            .mapToDouble(TelemetryEvent::getEngineTemp)
            .max()
            .orElse(70.0);

        if (avgTemp > 90) score += 25;
        else if (avgTemp > 85) score += 15;
        else if (avgTemp > 80) score += 8;

        if (maxTemp > 105) score += 15;
        else if (maxTemp > 95) score += 10;

        // 2. Vibration Analysis (0-35 points)
        double avgVibration = recentEvents.stream()
            .mapToDouble(TelemetryEvent::getVibrationLevel)
            .average()
            .orElse(0.0);
        double maxVibration = recentEvents.stream()
            .mapToDouble(TelemetryEvent::getVibrationLevel)
            .max()
            .orElse(0.0);

        if (avgVibration > 6) score += 25;
        else if (avgVibration > 4) score += 15;
        else if (avgVibration > 2) score += 8;

        if (maxVibration > 8) score += 10;

        // 3. Harsh Braking Frequency (0-25 points)
        long harshBrakingCount = recentEvents.stream()
            .filter(TelemetryEvent::getIsHarshBraking)
            .count();
        
        double harshBrakingRate = (double) harshBrakingCount / recentEvents.size();
        if (harshBrakingRate > 0.3) score += 25;
        else if (harshBrakingRate > 0.2) score += 18;
        else if (harshBrakingRate > 0.1) score += 12;
        else if (harshBrakingRate > 0.05) score += 6;

        // 4. Speed Consistency (0-10 points - high speed variations indicate stress)
        double speedStdDev = calculateStdDev(
            recentEvents.stream().mapToDouble(TelemetryEvent::getSpeedKph).toArray()
        );

        if (speedStdDev > 40) score += 10;
        else if (speedStdDev > 25) score += 6;

        return Math.min(100.0, score);
    }

    @Override
    public Map<String, Object> getMaintenanceInsights(Long vehicleId) {
        List<TelemetryEvent> recentEvents = telemetryRepository.findByVehicleIdOrderByRecordedAtDesc(
            vehicleId
        ).stream().limit(100).toList();

        Map<String, Object> insights = new LinkedHashMap<>();

        double probability = calculateMaintenanceProbability(vehicleId);
        insights.put("maintenanceProbability", probability);
        insights.put("riskLevel", getRiskLevel(probability));

        if (!recentEvents.isEmpty()) {
            // Vehicle information
            if (recentEvents.get(0).getVehicle() != null) {
                var vehicle = recentEvents.get(0).getVehicle();
                Map<String, Object> vehicleInfo = new LinkedHashMap<>();
                vehicleInfo.put("id", vehicle.getId());
                vehicleInfo.put("make", vehicle.getMake());
                vehicleInfo.put("model", vehicle.getModel());
                vehicleInfo.put("licensePlate", vehicle.getLicensePlate());
                insights.put("vehicle", vehicleInfo);
            }

            // Last driver information
            var lastDriverEvent = recentEvents.stream()
                .filter(e -> e.getDriverProfile() != null)
                .findFirst();
            
            if (lastDriverEvent.isPresent()) {
                var driver = lastDriverEvent.get().getDriverProfile();
                Map<String, Object> driverInfo = new LinkedHashMap<>();
                driverInfo.put("id", driver.getId());
                driverInfo.put("fullName", driver.getFullName());
                driverInfo.put("licenseNumber", driver.getLicenseNumber());
                insights.put("lastDriver", driverInfo);
            }

            // Temperature metrics
            double avgTemp = recentEvents.stream()
                .mapToDouble(TelemetryEvent::getEngineTemp)
                .average()
                .orElse(70.0);
            double maxTemp = recentEvents.stream()
                .mapToDouble(TelemetryEvent::getEngineTemp)
                .max()
                .orElse(70.0);
            insights.put("avgEngineTemp", Math.round(avgTemp * 10.0) / 10.0);
            insights.put("maxEngineTemp", Math.round(maxTemp * 10.0) / 10.0);

            // Vibration metrics
            double avgVibration = recentEvents.stream()
                .mapToDouble(TelemetryEvent::getVibrationLevel)
                .average()
                .orElse(0.0);
            insights.put("avgVibration", Math.round(avgVibration * 10.0) / 10.0);

            // Harsh braking count
            long harshBrakingCount = recentEvents.stream()
                .filter(TelemetryEvent::getIsHarshBraking)
                .count();
            insights.put("harshBrakingEvents", harshBrakingCount);

            // Recommendations
            insights.put("recommendations", generateRecommendations(insights));
        }

        return insights;
    }

    @Override
    public MaintenanceAlert analyzeForAnomalies(TelemetryEvent event) {
        if (event == null || event.getVehicle() == null) {
            return new MaintenanceAlert(
                null, 0.0, "UNKNOWN", "No data", List.of()
            );
        }

        double probability = calculateMaintenanceProbability(event.getVehicle().getId());
        String riskLevel = getRiskLevel(probability);
        
        // Determine primary cause
        String primaryCause = "Normal Operation";
        if (event.getEngineTemp() > 100) {
            primaryCause = "High Engine Temperature";
        } else if (event.getVibrationLevel() > 7) {
            primaryCause = "Excessive Vibration";
        } else if (event.getIsHarshBraking()) {
            primaryCause = "Harsh Braking Event";
        }

        List<String> recommendations = generateRecommendations(
            Map.of(
                "maintenanceProbability", probability,
                "avgEngineTemp", event.getEngineTemp(),
                "avgVibration", event.getVibrationLevel()
            )
        );

        return new MaintenanceAlert(
            event.getVehicle().getId(),
            probability,
            riskLevel,
            primaryCause,
            recommendations
        );
    }

    private String getRiskLevel(double probability) {
        if (probability >= 80) return "CRITICAL";
        if (probability >= 60) return "HIGH";
        if (probability >= 40) return "MEDIUM";
        return "LOW";
    }

    private List<String> generateRecommendations(Map<String, Object> insights) {
        List<String> recommendations = new ArrayList<>();
        double probability = (Double) insights.get("maintenanceProbability");
        
        if (probability >= 80) {
            recommendations.add("🚨 URGENT: Schedule immediate maintenance inspection");
            recommendations.add("Check engine health and coolant system");
            recommendations.add("Inspect transmission and brake components");
        } else if (probability >= 60) {
            recommendations.add("⚠️ Schedule maintenance within 48 hours");
            recommendations.add("Monitor engine temperature closely");
            recommendations.add("Check for fluid leaks");
        } else if (probability >= 40) {
            recommendations.add("Monitor vehicle performance");
            recommendations.add("Schedule routine maintenance soon");
        }

        Double avgTemp = (Double) insights.get("avgEngineTemp");
        if (avgTemp != null && avgTemp > 95) {
            recommendations.add("Engine running hot - check cooling system");
        }

        Double vibration = (Double) insights.get("avgVibration");
        if (vibration != null && vibration > 6) {
            recommendations.add("High vibration detected - check suspension and alignment");
        }

        return recommendations;
    }

    private double calculateStdDev(double[] values) {
        if (values.length == 0) return 0;
        
        double mean = Arrays.stream(values).average().orElse(0);
        double variance = Arrays.stream(values)
            .map(v -> Math.pow(v - mean, 2))
            .average()
            .orElse(0);
        
        return Math.sqrt(variance);
    }
}
