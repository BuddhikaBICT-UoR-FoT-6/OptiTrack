package com.optitrack.service.impl;

import com.optitrack.model.entity.Scorecard;
import com.optitrack.repository.ScorecardRepository;
import com.optitrack.service.ScorecardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScorecardServiceImpl implements ScorecardService {

    private final ScorecardRepository scorecardRepository;

    @Override
    public Scorecard generateScorecard(Long driverId) {
        // This is where we'll later call the AI analysis logic
        return null;
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
