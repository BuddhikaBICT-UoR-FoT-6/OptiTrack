package com.optitrack.service;

import com.optitrack.model.entity.DriverProfile;
import java.util.List;

public interface DriverService {
    DriverProfile createDriver(DriverProfile driver);

    List<DriverProfile> getAllDrivers();

    DriverProfile getDriverById(Long id);

    DriverProfile updateDriver(Long id, DriverProfile driver);

    DriverProfile updateDriverStatus(Long id, String status);
    void updateBaseSalary(Long id, Double amount);
    void deleteDriver(Long id);
}
