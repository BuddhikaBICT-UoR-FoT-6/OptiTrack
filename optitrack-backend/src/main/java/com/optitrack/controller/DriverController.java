package com.optitrack.controller;

import com.optitrack.model.entity.DriverProfile;
import com.optitrack.service.DriverService;
import com.optitrack.service.PerformanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final PerformanceService performanceService;

    @GetMapping
    public ResponseEntity<List<DriverProfile>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @PostMapping
    public ResponseEntity<DriverProfile> createDriver(@RequestBody DriverProfile driver) {
        return ResponseEntity.ok(driverService.createDriver(driver));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverProfile> updateDriver(@PathVariable Long id, @RequestBody DriverProfile driver) {
        return ResponseEntity.ok(driverService.updateDriver(id, driver));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/insights")
    public ResponseEntity<String> getDriverInsights(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.getDriverInsights(id));
    }

    @GetMapping("/{id}/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateSalary(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.evaluateSalary(id));
    }

    @PostMapping("/{id}/base-salary")
    public ResponseEntity<Void> updateBaseSalary(@PathVariable Long id, @RequestParam Double amount) {
        driverService.updateBaseSalary(id, amount);
        return ResponseEntity.ok().build();
    }
}
