package com.optitrack.controller;

import com.optitrack.model.entity.Scorecard;
import com.optitrack.service.ScorecardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scorecards")
@RequiredArgsConstructor
public class ScorecardController {

    private final ScorecardService scorecardService;

    @GetMapping("/driver/{driverId}")
    public ResponseEntity<List<Scorecard>> getDriverScorecards(@PathVariable Long driverId) {
        return ResponseEntity.ok(scorecardService.getScorecardsByDriver(driverId));
    }

    @GetMapping("/driver/{driverId}/latest")
    public ResponseEntity<Scorecard> getLatestScorecard(@PathVariable Long driverId) {
        Scorecard latest = scorecardService.getLatestScorecard(driverId);
        if (latest == null) {
            // Auto-generate a scorecard on first request so clients never get a 404
            try {
                latest = scorecardService.generateScorecard(driverId);
            } catch (RuntimeException e) {
                return ResponseEntity.notFound().build();
            }
        }
        return ResponseEntity.ok(latest);
    }

    /**
     * Triggers a fresh AI analysis and generates a new scorecard for the driver.
     */
    @PostMapping("/generate/{driverId}")
    public ResponseEntity<Scorecard> generateScorecard(@PathVariable Long driverId) {
        return ResponseEntity.ok(scorecardService.generateScorecard(driverId));
    }
}
