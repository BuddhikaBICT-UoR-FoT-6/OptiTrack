package com.optitrack.service;

import com.optitrack.model.entity.Scorecard;
import java.util.List;

public interface ScorecardService {
    Scorecard generateScorecard(Long driverId);

    List<Scorecard> getScorecardsByDriver(Long driverId);

    Scorecard getLatestScorecard(Long driverId);
}
