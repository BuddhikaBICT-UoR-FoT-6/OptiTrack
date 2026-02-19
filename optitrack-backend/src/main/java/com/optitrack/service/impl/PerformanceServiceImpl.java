package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceServiceImpl implements PerformanceService {

    private final DriverProfileRepository driverRepository;

    @Override
    @Transactional
    public String evaluateSalary(Long driverId) {
        DriverProfile profile = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        double score = profile.getAverageScore();
        String recommendation;
        
        if (score >= 9.0) {
            recommendation = "INCREASE";
            adjustSalary(driverId, 5.0); // 5% increase
        } else if (score < 7.0) {
            recommendation = "DECREASE";
            adjustSalary(driverId, -5.0); // 5% decrease
        } else {
            recommendation = "REMAIN_SAME";
        }
        
        log.info("📊 [OPTI-PERFORMANCE] Driver {} evaluated: {}. Current Score: {}", driverId, recommendation, score);
        return recommendation;
    }

    @Override
    @Transactional
    public void adjustSalary(Long driverId, double percentage) {
        DriverProfile profile = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        double current = profile.getCurrentSalary();
        double adjustment = current * (percentage / 100.0);
        profile.setCurrentSalary(current + adjustment);
        driverRepository.save(profile);
        
        log.info("💰 [OPTI-CASH] Salary adjusted for driver {}: {}% ({} units). New Salary: {}", 
                driverId, percentage, adjustment, profile.getCurrentSalary());
    }
}
