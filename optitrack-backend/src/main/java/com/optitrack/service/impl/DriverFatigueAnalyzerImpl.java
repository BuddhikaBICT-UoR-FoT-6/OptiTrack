package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.DriverFatigueAnalyzer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Analyzes driver fatigue patterns from simulated dashcam AI.
 * Detects: eyes off road, yawning, distraction, and overall fatigue.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DriverFatigueAnalyzerImpl implements DriverFatigueAnalyzer {

    private final DriverProfileRepository driverRepository;
    private final TelemetryEventRepository telemetryRepository;

    private final Random random = new Random();
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm:ss");

    @Override
    public double calculateFatigueScore(Long driverId) {
        // Get recent telemetry for this driver
        List<TelemetryEvent> recentEvents = telemetryRepository.findAll().stream()
            .filter(e -> e.getDriverProfile() != null && e.getDriverProfile().getId().equals(driverId))
            .sorted(Comparator.comparing(TelemetryEvent::getRecordedAt).reversed())
            .limit(100)
            .toList();

        if (recentEvents.isEmpty()) {
            return 0.0;
        }

        double score = 0.0;

        // 1. Harsh Braking Frequency (indicator of drowsy/inattentive driving)
        long harshBrakingCount = recentEvents.stream()
            .filter(TelemetryEvent::getIsHarshBraking)
            .count();
        double harshBrakingRate = (double) harshBrakingCount / recentEvents.size();
        
        if (harshBrakingRate > 0.25) score += 40;
        else if (harshBrakingRate > 0.15) score += 25;
        else if (harshBrakingRate > 0.08) score += 15;

        // 2. High Vibration (could indicate drowsy swerving)
        double avgVibration = recentEvents.stream()
            .mapToDouble(TelemetryEvent::getVibrationLevel)
            .average()
            .orElse(0.0);
        
        if (avgVibration > 7) score += 35;
        else if (avgVibration > 5) score += 20;
        else if (avgVibration > 3) score += 10;

        // 3. Speed Inconsistency (drowsy drivers weave and brake suddenly)
        double speedStdDev = calculateSpeedStdDev(recentEvents);
        if (speedStdDev > 45) score += 25;
        else if (speedStdDev > 30) score += 15;

        // 4. Time of day penalty (late night = higher fatigue risk)
        long lateNightEvents = recentEvents.stream()
            .filter(e -> {
                int hour = e.getRecordedAt().getHour();
                return hour >= 22 || hour <= 5;
            })
            .count();
        
        if (lateNightEvents > recentEvents.size() * 0.5) score += 20;

        // 5. Continuous driving duration (estimated from consecutive timestamps)
        long consecutiveEvents = recentEvents.stream()
            .filter(e -> {
                long minAgo = java.time.temporal.ChronoUnit.MINUTES
                    .between(e.getRecordedAt(), LocalDateTime.now());
                return minAgo < 120; // Last 2 hours
            })
            .count();
        
        if (consecutiveEvents > 20) score += 15; // 100+ minutes of continuous drive data

        return Math.min(100.0, score);
    }

    @Override
    public Map<String, Object> getFatigueInsights(Long driverId) {
        Map<String, Object> insights = new LinkedHashMap<>();

        double fatigueScore = calculateFatigueScore(driverId);
        insights.put("fatigueScore", fatigueScore);
        insights.put("fatigueLevel", getFatigueLevel(fatigueScore));

        Optional<DriverProfile> driverOpt = driverRepository.findById(driverId);
        if (driverOpt.isPresent()) {
            DriverProfile driver = driverOpt.get();
            insights.put("driverName", driver.getFullName());
            
            // Get incident counts from recent telemetry
            List<TelemetryEvent> recentEvents = telemetryRepository.findAll().stream()
                .filter(e -> e.getDriverProfile() != null && e.getDriverProfile().getId().equals(driverId))
                .sorted(Comparator.comparing(TelemetryEvent::getRecordedAt).reversed())
                .limit(100)
                .toList();
            
            long harshBrakingCount = recentEvents.stream()
                .filter(TelemetryEvent::getIsHarshBraking)
                .count();
            
            insights.put("totalIncidents", harshBrakingCount);
            insights.put("harshBrakingCount", harshBrakingCount);

            // Last vehicle information
            var lastVehicleEvent = recentEvents.stream()
                .filter(e -> e.getVehicle() != null)
                .findFirst();
            
            if (lastVehicleEvent.isPresent()) {
                var vehicle = lastVehicleEvent.get().getVehicle();
                Map<String, Object> vehicleInfo = new LinkedHashMap<>();
                vehicleInfo.put("id", vehicle.getId());
                vehicleInfo.put("make", vehicle.getMake());
                vehicleInfo.put("model", vehicle.getModel());
                vehicleInfo.put("licensePlate", vehicle.getLicensePlate());
                insights.put("lastVehicle", vehicleInfo);
            }
        }

        // Recent dashcam analysis
        DashcamAnalysis latest = analyzeDashcamFrame(driverId);
        insights.put("latestDashcamAnalysis", latest);

        // Recommendations
        insights.put("recommendations", generateFatigueRecommendations(fatigueScore));

        return insights;
    }

    @Override
    public DashcamAnalysis analyzeDashcamFrame(Long driverId) {
        LocalDateTime now = LocalDateTime.now();
        
        // Simulate dashcam detection based on fatigue score
        double fatigueScore = calculateFatigueScore(driverId);
        
        // Eyes detection probability increases with fatigue
        boolean eyesDetected = random.nextDouble() > (fatigueScore / 200); // 50% base + fatigue factor
        boolean eyesOnRoad = eyesDetected && (random.nextDouble() > (fatigueScore / 150));
        
        // Yawning detection increases with fatigue
        boolean yawning = random.nextDouble() < (fatigueScore / 300); // Rare, but more likely with fatigue
        
        // Attention level inversely correlates with fatigue
        double attentionLevel = Math.max(0, 100 - fatigueScore + random.nextDouble() * 20);
        
        String alert = null;
        String recommendation = null;
        
        if (!eyesOnRoad && eyesDetected) {
            alert = "EYES_OFF_ROAD";
            recommendation = "⚠️ Eyes off road detected! Please maintain focus on the road.";
        } else if (yawning) {
            alert = "YAWNING";
            recommendation = "😴 Fatigue detected! Consider taking a break.";
        } else if (attentionLevel < 50) {
            alert = "DISTRACTED";
            recommendation = "Please refocus on driving.";
        }

        return new DashcamAnalysis(
            driverId,
            now.format(TIME_FORMATTER),
            eyesDetected,
            eyesOnRoad,
            yawning,
            Math.round(attentionLevel * 10.0) / 10.0,
            alert,
            recommendation
        );
    }

    @Override
    public List<FatigueAlert> getRecentFatigueAlerts(Long driverId) {
        List<FatigueAlert> alerts = new ArrayList<>();
        
        // Simulate recent alerts based on driver behavior
        double fatigueScore = calculateFatigueScore(driverId);
        
        if (fatigueScore > 70) {
            alerts.add(new FatigueAlert(
                driverId,
                "YAWNING",
                LocalDateTime.now().minusMinutes(5).format(TIME_FORMATTER),
                "HIGH"
            ));
        }
        
        if (fatigueScore > 50) {
            alerts.add(new FatigueAlert(
                driverId,
                "EYES_OFF_ROAD",
                LocalDateTime.now().minusMinutes(3).format(TIME_FORMATTER),
                fatigueScore > 70 ? "HIGH" : "MEDIUM"
            ));
        }
        
        if (fatigueScore > 35) {
            alerts.add(new FatigueAlert(
                driverId,
                "DISTRACTED",
                LocalDateTime.now().minusMinutes(1).format(TIME_FORMATTER),
                "MEDIUM"
            ));
        }

        return alerts;
    }

    private String getFatigueLevel(double score) {
        if (score >= 80) return "CRITICAL";
        if (score >= 60) return "HIGH";
        if (score >= 40) return "MEDIUM";
        if (score >= 20) return "LOW";
        return "NORMAL";
    }

    private List<String> generateFatigueRecommendations(double score) {
        List<String> recommendations = new ArrayList<>();
        
        if (score >= 80) {
            recommendations.add("🚨 URGENT: Driver needs immediate rest - pull over safely");
            recommendations.add("High fatigue risk detected");
            recommendations.add("Consider reassigning route or relief driver");
        } else if (score >= 60) {
            recommendations.add("⚠️ High fatigue - recommend break soon");
            recommendations.add("Monitor closely for next 30 minutes");
            recommendations.add("Ensure driver is hydrated and alert");
        } else if (score >= 40) {
            recommendations.add("Moderate fatigue detected");
            recommendations.add("Schedule a rest break");
        } else if (score >= 20) {
            recommendations.add("Monitor driver performance");
        }

        return recommendations;
    }

    private double calculateSpeedStdDev(List<TelemetryEvent> events) {
        if (events.isEmpty()) return 0;
        
        double[] speeds = events.stream()
            .mapToDouble(TelemetryEvent::getSpeedKph)
            .toArray();
        
        double mean = Arrays.stream(speeds).average().orElse(0);
        double variance = Arrays.stream(speeds)
            .map(v -> Math.pow(v - mean, 2))
            .average()
            .orElse(0);
        
        return Math.sqrt(variance);
    }
}
