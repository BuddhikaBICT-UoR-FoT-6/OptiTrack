package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
    public DriverProfile updateDriverStatus(Long id, String status) {
        DriverProfile driver = getDriverById(id);
        driver.setStatus(status);
        return driverRepository.save(driver);
    }

    @Override
    @Transactional
    public void updateBaseSalary(Long id, Double amount) {
        DriverProfile driver = getDriverById(id);
        driver.setBaseSalary(amount);
        // Also update current salary to match the new base
        driver.setCurrentSalary(amount);
        driverRepository.save(driver);
    }

    @Override
    @Transactional
    public void deleteDriver(Long id) {
        driverRepository.deleteById(id);
    }
}
