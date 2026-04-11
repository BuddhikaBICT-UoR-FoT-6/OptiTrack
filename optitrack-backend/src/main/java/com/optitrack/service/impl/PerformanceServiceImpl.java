package com.optitrack.service.impl;

import com.optitrack.ai.GeminiAnalyzer;
import com.optitrack.model.entity.Delivery;
import com.optitrack.model.entity.DriverProfile;
import com.optitrack.repository.DeliveryRepository;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PerformanceServiceImpl implements PerformanceService {

    private final DriverProfileRepository driverRepository;
    private final DeliveryRepository deliveryRepository;
    private final GeminiAnalyzer geminiAnalyzer;

    @Override
    public String getDriverInsights(Long driverId) {
        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found: " + driverId));
        
        if (driver.getAssignedVehicle() == null) {
            return "No vehicle assigned to driver yet. Performance insights cannot be analyzed without driving history.";
        }
        List<Delivery> history = deliveryRepository.findByVehicleId(driver.getAssignedVehicle().getId());
        return geminiAnalyzer.analyzeDriverProfile(driver, history);
    }

    @Override
    @Transactional
    public Map<String, Object> evaluateSalary(Long driverId) {
        DriverProfile driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found: " + driverId));

        if (driver.getAssignedVehicle() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Driver has no assigned vehicle");
        }
        List<Delivery> history = deliveryRepository.findByVehicleId(driver.getAssignedVehicle().getId());
        
        double avgUserRating = history.stream()
                .filter(d -> d.getUserRating() != null)
                .mapToDouble(Delivery::getUserRating)
                .average()
                .orElse(4.0); // Baseline rating

        // Salary Algorithm: 70% Internal Safety Score + 30% User Rating
        double internalWeight = (driver.getAverageScore() / 10.0) * 0.7;
        double externalWeight = (avgUserRating / 5.0) * 0.3;
        double combinedScore = (internalWeight + externalWeight) * 10.0;

        String action = "MAINTAIN";
        if (combinedScore > 8.5) {
            action = "INCREASE";
            driver.setCurrentSalary(driver.getBaseSalary() * 1.10);
        } else if (combinedScore < 6.0) {
            action = "DECREASE";
            driver.setCurrentSalary(driver.getBaseSalary() * 0.95);
        } else {
            driver.setCurrentSalary(driver.getBaseSalary());
        }

        driverRepository.save(driver);

        Map<String, Object> report = new HashMap<>();
        report.put("driverName", driver.getFullName());
        report.put("score", combinedScore);
        report.put("avgUserRating", avgUserRating);
        report.put("action", action);
        report.put("newSalary", driver.getCurrentSalary());
        
        log.info("📊 [OPTI-MERIT] Salary evaluation for {}: Score {}, Action {}", 
                driver.getFullName(), combinedScore, action);
        
        return report;
    }
}
