package com.optitrack.service.impl;

import com.optitrack.model.entity.Vehicle;
import com.optitrack.repository.VehicleRepository;
import com.optitrack.service.VehicleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    @Override
    public Vehicle createVehicle(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Override
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found with ID: " + id));
    }

    @Override
    public Vehicle updateVehicleStatus(Long id, String status) {
        Vehicle vehicle = getVehicleById(id);
        vehicle.setStatus(com.optitrack.model.enums.VehicleStatus.valueOf(status.toUpperCase()));
        return vehicleRepository.save(vehicle);
    }

    @Override
    public void deleteVehicle(Long id) {
        vehicleRepository.deleteById(id);
    }
}
