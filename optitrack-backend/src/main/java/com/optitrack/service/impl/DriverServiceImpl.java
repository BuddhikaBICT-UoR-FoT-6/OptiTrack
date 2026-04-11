package com.optitrack.service.impl;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverServiceImpl implements DriverService {

    private final DriverProfileRepository driverProfileRepository;

    @Override
    public List<DriverProfile> getAllDrivers() {
        return driverProfileRepository.findAll();
    }

    @Override
    public DriverProfile createDriver(DriverProfile driver) {
        return driverProfileRepository.save(driver);
    }

    @Override
    public DriverProfile getDriverById(Long id) {
        return driverProfileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found: " + id));
    }

    @Override
    @Transactional
    public DriverProfile updateDriver(Long id, DriverProfile driverDetails) {
        DriverProfile driver = getDriverById(id);
        driver.setFullName(driverDetails.getFullName());
        driver.setLicenseNumber(driverDetails.getLicenseNumber());
        driver.setExperienceYears(driverDetails.getExperienceYears());
        // Do not update score or salary here as they are merit-calculated
        return driverProfileRepository.save(driver);
    }

    @Override
    @Transactional
    public void updateBaseSalary(Long id, Double amount) {
        DriverProfile driver = getDriverById(id);
        driver.setBaseSalary(amount);
        // Recalculate current salary based on performance multiplier (if any)
        driver.setCurrentSalary(amount); // Simple sync for now
        driverProfileRepository.save(driver);
    }

    @Override
    @Transactional
    public DriverProfile updateDriverStatus(Long id, String status) {
        DriverProfile driver = getDriverById(id);
        driver.setStatus(status);
        return driverProfileRepository.save(driver);
    }

    @Override
    @Transactional
    public void deleteDriver(Long id) {
        driverProfileRepository.deleteById(id);
    }
}
