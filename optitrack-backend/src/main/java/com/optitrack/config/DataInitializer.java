package com.optitrack.config;

import com.optitrack.model.entity.*;
import com.optitrack.model.enums.*;
import com.optitrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;

/**
 * Purpose: Automatically seeds the database with roles, users, vehicles, drivers, and scorecards.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VehicleRepository vehicleRepository;
    private final DriverProfileRepository driverRepository;
    private final ScorecardRepository scorecardRepository;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Roles
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(null, roleName));
            }
        }

        // 2. Seed Default Admin
        User admin = userRepository.findByUsername(adminUsername).orElse(new User());
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRoles(Collections.singleton(roleRepository.findByName(RoleName.ROLE_ADMIN).get()));
        userRepository.save(admin);

        // 3. Seed Vehicles
        if (vehicleRepository.count() == 0) {
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate("TRK-001").make("Freightliner").model("Cascadia").year(2022)
                    .status(VehicleStatus.ACTIVE).build());
            
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate("TRK-002").make("Volvo").model("VNL 860").year(2023)
                    .status(VehicleStatus.ACTIVE).build());
        }

        // 4. Seed Drivers
        if (driverRepository.count() == 0) {
            seedDriverWithScorecard("johndoe", "John Doe", "john@optitrack.com", "DL-12345", 10, 9.2);
            seedDriverWithScorecard("janesmith", "Jane Smith", "jane@optitrack.com", "DL-67890", 5, 8.8);
            System.out.println("Seeded Core Fleet Data and Safety Scorecards.");
        }
    }

    private void seedDriverWithScorecard(String username, String fullName, String email, String dl, int exp, double score) {
        User user = userRepository.findByUsername(username).orElseGet(() -> {
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setEmail(email);
            newUser.setPassword(passwordEncoder.encode("driver123"));
            newUser.setRoles(Collections.singleton(roleRepository.findByName(RoleName.ROLE_USER).get()));
            return userRepository.save(newUser);
        });

        DriverProfile profile = driverRepository.findByLicenseNumber(dl).orElseGet(() -> {
            DriverProfile newProfile = DriverProfile.builder()
                    .user(user).fullName(fullName).licenseNumber(dl).experienceYears(exp).averageScore(score).totalHoursDriven(0.0).build();
            return driverRepository.save(newProfile);
        });

        if (scorecardRepository.findFirstByDriverProfileIdOrderByGeneratedAtDesc(profile.getId()).isEmpty()) {
            scorecardRepository.save(Scorecard.builder()
                    .driverProfile(profile)
                    .periodDate(LocalDate.now())
                    .safetyRating(score)
                    .efficiencyRating(8.5)
                    .aiRecommendations("Maintain consistent speed and reduce idle time.")
                    .generatedAt(LocalDateTime.now())
                    .build());
            System.out.println("Seeded Scorecard for driver: " + fullName);
        }
    }
}
