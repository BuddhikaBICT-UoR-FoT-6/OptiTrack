package com.optitrack.controller;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    public ResponseEntity<List<DriverProfile>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @PostMapping
    public ResponseEntity<DriverProfile> createDriver(@RequestBody DriverProfile driver) {
        return ResponseEntity.ok(driverService.createDriver(driver));
    }
}
