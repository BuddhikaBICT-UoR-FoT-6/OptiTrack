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
        return ResponseEntity.ok(scorecardService.getLatestScorecard(driverId));
    }
}
