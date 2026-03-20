package com.optitrack.service;

import java.util.Map;

public interface PerformanceService {
    String getDriverInsights(Long driverId);
    Map<String, Object> evaluateSalary(Long driverId);
}
