package com.optitrack.config;

import com.optitrack.model.entity.User;
import com.optitrack.model.entity.Role;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.model.enums.VehicleStatus;
import com.optitrack.model.enums.RoleName;
import com.optitrack.repository.RoleRepository;
import com.optitrack.repository.UserRepository;

import com.optitrack.repository.VehicleRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

/**
 * Purpose: Automatically seeds the database with required roles on startup.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VehicleRepository vehicleRepository;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles if they don't exist
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(null, roleName));
                System.out.println("Seeded Role: " + roleName);
            }
        }

        // 2. Seed/Update Default Admin User
        User admin = userRepository.findByUsername("admin").orElse(new User());
        admin.setUsername("admin");
        admin.setEmail("admin@optitrack.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRoles(Collections.singleton(roleRepository.findByName(RoleName.ROLE_ADMIN).get()));

        userRepository.save(admin);
        System.out.println("DEBUG: Admin password has been forced to 'admin123'");

        if (vehicleRepository.count() == 0) {
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate("TRK-001")
                    .make("Freightliner")
                    .model("Cascadia")
                    .year(2022)
                    .status(VehicleStatus.ACTIVE)
                    .build());
            
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate("TRK-002")
                    .make("Volvo")
                    .model("VNL 860")
                    .year(2023)
                    .status(VehicleStatus.ACTIVE)
                    .build());
            
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate("TRK-003")
                    .make("Peterbilt")
                    .model("579")
                    .year(2021)
                    .status(VehicleStatus.MAINTENANCE)
                    .build());
            
            System.out.println("Seeded 3 Sample Vehicles.");
        }
    }
}
