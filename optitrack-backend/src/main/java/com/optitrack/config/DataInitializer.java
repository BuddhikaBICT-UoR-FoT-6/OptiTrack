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
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(null, roleName));
            }
        }

        User admin = userRepository.findByUsername(adminUsername).orElse(new User());
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRoles(Collections.singleton(roleRepository.findByName(RoleName.ROLE_ADMIN).get()));
        userRepository.save(admin);

        ensureVehicleExists("TRK-001", "Freightliner", "Cascadia", 2022);
        ensureVehicleExists("TRK-002", "Volvo", "VNL 860", 2023);
        ensureVehicleExists("TRK-003", "Kenworth", "T680", 2021);

        List<Vehicle> vehicles = vehicleRepository.findAll();
        seedDriverWithScorecard("johndoe", "John Doe", "john@optitrack.com", "DL-12345", 10, 9.2, vehicles.get(0));
        seedDriverWithScorecard("janesmith", "Jane Smith", "jane@optitrack.com", "DL-67890", 5, 8.8, vehicles.get(1));
        seedDriverWithScorecard("mikejohnson", "Mike Johnson", "mike@optitrack.com", "DL-11223", 8, 9.0, vehicles.get(2));

        if (deliveryRepository.count() == 0) {
            System.out.println("🚛 [OPTI-SEED] Mapping Sri Lanka Logistics Network...");
            seedDelivery(vehicles.get(0), "Industrial Parts", "Kandy Engineering", "123 Peradeniya Rd, Kandy", Priority.HIGH, 7.2906, 80.6337, true, 5.0, true, false, 45L);
            seedDelivery(vehicles.get(0), "Medical Supplies", "Galle General Hospital", "Magalle, Galle", Priority.CRITICAL, 6.0535, 80.2210, true, 4.8, false, true, 120L);
            seedDelivery(vehicles.get(1), "Fresh Produce", "Jaffna Central Market", "Hospital Rd, Jaffna", Priority.MEDIUM, 9.6615, 80.0255, true, 4.5, true, true, 300L);
            seedDelivery(vehicles.get(1), "Electronics", "Unity Plaza", "Galle Rd, Colombo 04", Priority.HIGH, 6.8940, 79.8547, true, 5.0, false, false, 30L);
            
            seedDelivery(vehicles.get(2), "Apparel Batch", "Brandix Seeduwa", "Liyanagemulla, Seeduwa", Priority.MEDIUM, 7.1187, 79.8821, false, null, false, false, null);
            seedDelivery(vehicles.get(2), "Office Stationery", "Durdans Hospital", "Alfred Place, Colombo 03", Priority.LOW, 6.9070, 79.8510, false, null, false, false, null);
            seedDelivery(vehicles.get(0), "Spices Export", "Matale Plantation", "A9 Highway, Matale", Priority.MEDIUM, 7.4675, 80.6234, false, null, false, false, null);
            seedDelivery(vehicles.get(1), "Cement Load", "Holcim Puttalam", "Puttalam Road", Priority.HIGH, 8.0326, 79.8250, false, null, false, false, null);
            seedDelivery(vehicles.get(2), "Luxury Tea", "Nuwara Eliya Estate", "Grand Hotel Rd", Priority.HIGH, 6.9497, 80.7891, false, null, false, false, null);
            seedDelivery(vehicles.get(0), "Hardware Kit", "Batticaloa Shop", "Main St, Batticaloa", Priority.LOW, 7.7303, 81.6747, false, null, false, false, null);
            seedDelivery(vehicles.get(1), "Lubricants", "Trinco Port", "China Bay, Trincomalee", Priority.MEDIUM, 8.5756, 81.2405, false, null, false, false, null);
            seedDelivery(vehicles.get(2), "Retail Stock", "Kurunegala Mall", "Negombo Rd", Priority.MEDIUM, 7.4818, 80.3609, false, null, false, false, null);
        }
        System.out.println("🚀 [OPTI-SEED] High-Fidelity Logistics Ecosystem Verified.");
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
                    .baseSalary(55000.0)
                    .currentSalary(55000.0)
                    .assignedVehicle(assignedVehicle)
                    .totalHoursDriven(120.0)
                    .build();
            return driverRepository.save(newProfile);
        });

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
        }
    }

    private void ensureVehicleExists(String lp, String make, String model, int year) {
        if (vehicleRepository.findByLicensePlate(lp).isEmpty()) {
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate(lp).make(make).model(model).year(year)
                    .status(VehicleStatus.ACTIVE).build());
        }
    }

    private void seedDelivery(Vehicle vehicle, String pkg, String owner, String addr, Priority priority, double lat, double lon, boolean delivered, Double rating, boolean night, boolean weather, Long timing) {
        deliveryRepository.save(Delivery.builder()
                .vehicle(vehicle)
                .packageName(pkg)
                .ownerName(owner)
                .address(addr)
                .priority(priority)
                .isDelivered(delivered)
                .status(delivered ? DeliveryStatus.DELIVERED : DeliveryStatus.IN_TRANSIT)
                .userRating(rating)
                .isNightDelivery(night)
                .isWeatherChallenged(weather)
                .assignmentToDeliveryMinutes(timing)
                .destinationLat(lat)
                .destinationLon(lon)
                .assignedAt(LocalDateTime.now().minusDays(1))
                .deliveredAt(delivered ? LocalDateTime.now() : null)
                .qrCodeData("OPT-QR-" + pkg.toUpperCase().replace(" ", "-"))
                .build());
    }
}