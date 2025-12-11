package com.optitrack.service;

import com.optitrack.model.entity.Vehicle;
import java.util.List;

public interface VehicleService {
    Vehicle createVehicle(Vehicle vehicle);

    List<Vehicle> getAllVehicles();

    Vehicle getVehicleById(Long id);

    Vehicle updateVehicleStatus(Long id, String status);

    void deleteVehicle(Long id);
}
