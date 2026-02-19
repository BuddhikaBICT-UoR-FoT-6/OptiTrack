package com.optitrack.service;

import com.optitrack.model.entity.DriverProfile;

public interface PerformanceService {
    String evaluateSalary(Long driverId);
    void adjustSalary(Long driverId, double percentage);
}
