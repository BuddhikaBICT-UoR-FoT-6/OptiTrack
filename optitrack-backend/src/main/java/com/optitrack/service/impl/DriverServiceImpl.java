package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverProfileRepository driverRepository;

    @Override
    public DriverProfile createDriver(DriverProfile driver) {
        return driverRepository.save(driver);
    }

    @Override
    public List<DriverProfile> getAllDrivers() {
        return driverRepository.findAll();
    }

    @Override
    public DriverProfile getDriverById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
    }

    @Override
    public DriverProfile updateDriverStatus(Long id, String status) {
        DriverProfile driver = getDriverById(id);
        // Add logic to update status if needed
        return driverRepository.save(driver);
    }

    @Override
    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}
