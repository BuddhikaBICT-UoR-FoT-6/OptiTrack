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
import java.util.Random;

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

    private final Random random = new Random();

    @Override
    public void run(String... args) throws Exception {
        // Fast-exit if already seeded to prevent boot delays
        if (userRepository.findByUsername(adminUsername).isPresent()) {
            System.out.println("✅ [OPTI-SEED] System already synchronized. Skipping heavy initialization.");
            return;
        }

        System.out.println("🚀 [OPTI-SEED] Synchronizing Sri Lankan Logistics Values...");
        
        // 1. Roles
        for (RoleName roleName : RoleName.values()) {
            if (roleRepository.findByName(roleName).isEmpty()) {
                roleRepository.save(new Role(null, roleName));
            }
        }

        // 2. Admin
        User admin = userRepository.findByUsername(adminUsername).orElse(new User());
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRoles(Collections.singleton(roleRepository.findByName(RoleName.ROLE_ADMIN).get()));
        userRepository.save(admin);

        // 3. Mass Vehicle Seeding (25+)
        String[] makes = {"Toyota", "Isuzu", "Mitsubishi", "Freightliner", "Volvo", "Hino", "Tata"};
        String[] models = {"HiAce", "NPR", "Canter", "Cascadia", "VNL", "500 Series", "Prima"};
        
        if (vehicleRepository.count() < 25) {
            for (int i = 1; i <= 30; i++) {
                String lp = String.format("LP-%03d", i);
                int typeIdx = random.nextInt(makes.length);
                ensureVehicleExists(lp, makes[typeIdx], models[typeIdx], 2020 + random.nextInt(5));
            }
        }

        List<Vehicle> vehicles = vehicleRepository.findAll();

        // 4. Mass Driver Seeding (22+)
        String[] firstNames = {"Amal", "Buddhika", "Chaminda", "Dinesh", "Eran", "Fazeer", "Gayan", "Harsha", "Indika", "Jayantha", "Kasun", "Lahiru", "Mahesh", "Niroshan", "Oshada", "Pradeep", "Quasim", "Ruwan", "Saman", "Thushara", "Udaya", "Vikum"};
        String[] lastNames = {"Perera", "Silva", "Fernando", "Jayawardena", "Wickramasinghe", "Rathnayake", "Gunawardena", "Rajapaksa", "Dassanayake", "Herath"};

        if (driverRepository.count() < 20) {
            for (int i = 0; i < 22; i++) {
                String fname = firstNames[i];
                String lname = lastNames[random.nextInt(lastNames.length)];
                String username = fname.toLowerCase() + i;
                String fullName = fname + " " + lname;
                String email = username + "@optitrack.com";
                String dl = String.format("DL-%05d", 10000 + i);
                
                Vehicle assigned = vehicles.stream()
                        .filter(v -> driverRepository.findByAssignedVehicleId(v.getId()).isEmpty())
                        .findFirst()
                        .orElse(null);
                
                seedDriverWithScorecard(username, fullName, email, dl, 5 + random.nextInt(15), 7.5 + random.nextDouble() * 2.5, assigned);
            }
        }

        // 5. Mass Delivery Seeding with SRI LANKAN Values
        if (deliveryRepository.count() < 10) {
            System.out.println("🚛 [OPTI-SEED] Mapping High-Fidelity Sri Lankan Logistics Network...");
            
            Object[][] srlHubs = {
                {"Colombo Port", "12 Harbour Rd, Colombo 01", 6.9428, 79.8481},
                {"Kandy Central", "88 Peradeniya Rd, Kandy", 7.2906, 80.6337},
                {"Galle Fort", "Church St, Galle Fort", 6.0267, 80.2167},
                {"Jaffna Market", "Hospital Rd, Jaffna", 9.6615, 80.0255},
                {"Trinco Harbour", "China Bay, Trincomalee", 8.5756, 81.2405},
                {"Kurunegala Hub", "Negombo Rd, Kurunegala", 7.4818, 80.3609},
                {"Matara Terminal", "Main St, Matara", 5.9496, 80.5469},
                {"Batticaloa Stn", "Bar Rd, Batticaloa", 7.7303, 81.6747},
                {"N'Eliya Estate", "Grand Hotel Rd, Nuwara Eliya", 6.9497, 80.7891},
                {"Dambulla Hub", "Matale Rd, Dambulla", 7.8731, 80.6517}
            };

            String[] cargo = {"Medical Vaccines", "Retail Electronics", "Industrial Tea", "Fresh Seafood", "Apparel Batch", "Luxury Spices", "Construction Cement", "Hardware Kits"};

            for (int i = 0; i < 20; i++) {
                Object[] hub = srlHubs[random.nextInt(srlHubs.length)];
                Vehicle v = vehicles.get(random.nextInt(vehicles.size()));
                
                seedDelivery(
                    v, 
                    cargo[random.nextInt(cargo.length)], 
                    (String)hub[0] + " Logistics", 
                    (String)hub[1], 
                    Priority.values()[random.nextInt(3)], 
                    (double)hub[2] + (random.nextDouble() - 0.5) * 0.1, // Slight variance for realism
                    (double)hub[3] + (random.nextDouble() - 0.5) * 0.1, 
                    false, null, false, false, null
                );
            }
        }

        System.out.println("🚀 [OPTI-SEED] Sri Lankan Logistics Ecosystem Fully Synchronized.");
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
                    .baseSalary(45000.0 + random.nextInt(20000))
                    .currentSalary(45000.0)
                    .assignedVehicle(assignedVehicle)
                    .totalHoursDriven(100.0 + random.nextInt(500))
                    .status("ACTIVE")
                    .build();
            return driverRepository.save(newProfile);
        });

        if (profile.getAssignedVehicle() == null && assignedVehicle != null) {
            if (driverRepository.findByAssignedVehicleId(assignedVehicle.getId()).isEmpty()) {
                profile.setAssignedVehicle(assignedVehicle);
                profile = driverRepository.save(profile);
            }
        }

        if (scorecardRepository.findFirstByDriverProfileIdOrderByGeneratedAtDesc(profile.getId()).isEmpty()) {
            scorecardRepository.save(Scorecard.builder()
                    .driverProfile(profile)
                    .periodDate(LocalDate.now())
                    .safetyRating(score)
                    .efficiencyRating(8.0 + random.nextDouble() * 2.0)
                    .aiRecommendations("Maintain optimal fuel levels and reduce idle time in traffic zones.")
                    .generatedAt(LocalDateTime.now())
                    .build());
        }
    }

    private void ensureVehicleExists(String lp, String make, String model, int year) {
        if (vehicleRepository.findByLicensePlate(lp).isEmpty()) {
            vehicleRepository.save(Vehicle.builder()
                    .licensePlate(lp).make(make).model(model).year(year)
                    .status(random.nextBoolean() ? VehicleStatus.ACTIVE : VehicleStatus.INACTIVE).build());
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
                .qrCodeData("OPT-QR-" + pkg.toUpperCase().replace(" ", "-") + "-" + random.nextInt(1000))
                .build());
    }
}