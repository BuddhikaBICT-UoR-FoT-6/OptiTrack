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
import java.util.List;

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
    private final DeliveryRepository deliveryRepository;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 [OPTI-SEED] Initializing Core Fleet Data...");
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
        ensureVehicleExists("TRK-001", "Freightliner", "Cascadia", 2022);
        ensureVehicleExists("TRK-002", "Volvo", "VNL 860", 2023);
        ensureVehicleExists("TRK-003", "Kenworth", "T680", 2021);

        // 4. Seed Drivers & Scorecards & Assignments
        List<Vehicle> vehicles = vehicleRepository.findAll();
        if (vehicles.size() < 3) {
            System.err.println("❌ [OPTI-SEED] Critical Error: Fleet initialization incomplete. Found only " + vehicles.size() + " units.");
            return;
        }
        seedDriverWithScorecard("johndoe", "John Doe", "john@optitrack.com", "DL-12345", 10, 9.2, vehicles.get(0));
        seedDriverWithScorecard("janesmith", "Jane Smith", "jane@optitrack.com", "DL-67890", 5, 8.8, vehicles.get(1));
        seedDriverWithScorecard("mikejohnson", "Mike Johnson", "mike@optitrack.com", "DL-11223", 8, 9.0, vehicles.get(2));

        // 5. Seed 12 Sri Lanka Logistics Locations
        if (deliveryRepository.count() == 0) {
            System.out.println("🚛 [OPTI-SEED] Mapping Sri Lanka Logistics Network...");
            seedDelivery(vehicles.get(0), "Industrial Parts", "Kandy Engineering", "123 Peradeniya Rd, Kandy", Priority.HIGH, 7.2906, 80.6337);
            seedDelivery(vehicles.get(0), "Medical Supplies", "Galle General Hospital", "Magalle, Galle", Priority.CRITICAL, 6.0535, 80.2210);
            seedDelivery(vehicles.get(1), "Fresh Produce", "Jaffna Central Market", "Hospital Rd, Jaffna", Priority.MEDIUM, 9.6615, 80.0255);
            seedDelivery(vehicles.get(1), "Electronics", "Unity Plaza", "Galle Rd, Colombo 04", Priority.HIGH, 6.8940, 79.8547);
            seedDelivery(vehicles.get(2), "Apparel Batch", "Brandix Seeduwa", "Liyanagemulla, Seeduwa", Priority.MEDIUM, 7.1187, 79.8821);
            seedDelivery(vehicles.get(2), "Office Stationery", "Durdans Hospital", "Alfred Place, Colombo 03", Priority.LOW, 6.9070, 79.8510);
            
            // Adding more to reach 12
            seedDelivery(vehicles.get(0), "Spices Export", "Matale Plantation", "A9 Highway, Matale", Priority.MEDIUM, 7.4675, 80.6234);
            seedDelivery(vehicles.get(1), "Cement Load", "Holcim Puttalam", "Puttalam Road", Priority.HIGH, 8.0326, 79.8250);
            seedDelivery(vehicles.get(2), "Luxury Tea", "Nuwara Eliya Estate", "Grand Hotel Rd", Priority.HIGH, 6.9497, 80.7891);
            seedDelivery(vehicles.get(0), "Hardware Kit", "Batticaloa Shop", "Main St, Batticaloa", Priority.LOW, 7.7303, 81.6747);
            seedDelivery(vehicles.get(1), "Lubricants", "Trinco Port", "China Bay, Trincomalee", Priority.MEDIUM, 8.5756, 81.2405);
            seedDelivery(vehicles.get(2), "Retail Stock", "Kurunegala Mall", "Negombo Rd", Priority.MEDIUM, 7.4818, 80.3609);
        }
        System.out.println("🚀 [OPTI-SEED] Fleet Data, Assignments and Sri Lanka Logistics verified.");
    }

    private void seedDriverWithScorecard(String username, String fullName, String email, String dl, int exp, double score, Vehicle assignedVehicle) {
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
                    .user(user)
                    .fullName(fullName)
                    .licenseNumber(dl)
                    .experienceYears(exp)
                    .averageScore(score)
                    .assignedVehicle(assignedVehicle)
                    .totalHoursDriven(0.0)
                    .build();
            return driverRepository.save(newProfile);
        });

        // Ensure assignment is updated even if profile existed
        if (profile.getAssignedVehicle() == null) {
            profile.setAssignedVehicle(assignedVehicle);
            profile = driverRepository.save(profile);
        }

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

    private void ensureVehicleExists(String lp, String make, String model, int year) {
        if (vehicleRepository.findByLicensePlate(lp).isEmpty()) {
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate(lp).make(make).model(model).year(year)
                    .status(VehicleStatus.ACTIVE).build());
            System.out.println("Seeded vehicle: " + lp);
        }
    }

    private void seedDelivery(Vehicle vehicle, String pkg, String owner, String addr, Priority priority, double lat, double lon) {
        deliveryRepository.save(Delivery.builder()
                .vehicle(vehicle)
                .packageName(pkg)
                .ownerName(owner)
                .address(addr)
                .priority(priority)
                .isDelivered(false)
                .destinationLat(lat)
                .destinationLon(lon)
                .assignedAt(LocalDateTime.now())
                .build());
    }
}
/ /   O p e r a t i o n a l   P u l s e :   S y s t e m   v e r i f i e d   f o r   F e b   2 0   d e p l o y m e n t  
 