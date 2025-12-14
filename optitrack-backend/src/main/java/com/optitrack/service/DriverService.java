package com.optitrack.service;

import com.optitrack.model.entity.DriverProfile;
import java.util.List;

public interface DriverService {
    DriverProfile createDriver(DriverProfile driver);

    List<DriverProfile> getAllDrivers();

    DriverProfile getDriverById(Long id);

    DriverProfile updateDriverStatus(Long id, String status);
}
