package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.Scorecard;
import com.optitrack.model.entity.TelemetryEvent;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.repository.ScorecardRepository;
import com.optitrack.repository.TelemetryEventRepository;
import com.optitrack.service.GeminiService;
import com.optitrack.service.ScorecardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScorecardServiceImpl implements ScorecardService {

    private final ScorecardRepository scorecardRepository;
    private final TelemetryEventRepository telemetryRepository;
    private final DriverProfileRepository driverRepository;
    private final GeminiService geminiService;

    @Override
    public Scorecard generateScorecard(Long driverId) {
        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // 1. Fetch recent telemetry (last 50 events)
        List<TelemetryEvent> events = telemetryRepository.findByDriverProfileIdOrderByRecordedAtDesc(driverId);
        if (events.size() > 50) events = events.subList(0, 50);

        // 2. Calculate performance metrics (simplified for now)
        double avgSpeed = events.stream().mapToDouble(TelemetryEvent::getSpeedKph).average().orElse(0.0);
        long harshBrakingCount = events.stream().filter(TelemetryEvent::getIsHarshBraking).count();
        
        // Calculate a score out of 10
        double safetyScore = Math.max(0, 10.0 - (harshBrakingCount * 0.5));
        double efficiencyScore = avgSpeed > 90 ? 7.0 : 9.0; // Over-speeding reduces efficiency

        // 3. Generate AI Recommendations
        String recommendations = geminiService.generateRecommendations(events);

        // 4. Create and Save Scorecard
        Scorecard scorecard = Scorecard.builder()
                .driverProfile(driver)
                .periodDate(LocalDate.now())
                .safetyRating(safetyScore)
                .efficiencyRating(efficiencyScore)
                .aiRecommendations(recommendations)
                .generatedAt(LocalDateTime.now())
                .build();

        return scorecardRepository.save(scorecard);
    }

    @Override
    public List<Scorecard> getScorecardsByDriver(Long driverId) {
        return scorecardRepository.findByDriverProfileIdOrderByGeneratedAtDesc(driverId);
    }

    @Override
    public Scorecard getLatestScorecard(Long driverId) {
        return scorecardRepository.findFirstByDriverProfileIdOrderByGeneratedAtDesc(driverId)
                .orElse(null);
    }
}
