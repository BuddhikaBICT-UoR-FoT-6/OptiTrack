package com.optitrack.service;

import com.optitrack.model.entity.Delivery;
import com.optitrack.model.entity.DriverProfile;
import com.optitrack.model.entity.Vehicle;
import com.optitrack.repository.DeliveryRepository;
import com.optitrack.repository.DriverProfileRepository;
import com.optitrack.service.impl.PerformanceServiceImpl;
import com.optitrack.ai.GeminiAnalyzer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PerformanceServiceTest {

    @Mock
    private DriverProfileRepository driverRepository;

    @Mock
    private DeliveryRepository deliveryRepository;

    @Mock
    private GeminiAnalyzer geminiAnalyzer;

    @InjectMocks
    private PerformanceServiceImpl performanceService;

    private DriverProfile mockDriver;
    private Vehicle mockVehicle;

    @BeforeEach
    void setUp() {
        mockVehicle = Vehicle.builder().id(1L).licensePlate("ABC-1234").build();
        mockDriver = DriverProfile.builder()
                .id(1L)
                .fullName("Buddhika Test")
                .baseSalary(50000.0)
                .averageScore(9.0) // Good safety score
                .assignedVehicle(mockVehicle)
                .build();
    }

    @Test
    void testEvaluateSalary_Increase() {
        // Arrange
        Delivery highRatingDelivery = Delivery.builder().userRating(5.0).build();
        when(driverRepository.findById(1L)).thenReturn(Optional.of(mockDriver));
        when(deliveryRepository.findByVehicleId(1L)).thenReturn(List.of(highRatingDelivery));

        // Act
        Map<String, Object> result = performanceService.evaluateSalary(1L);

        // Assert
        assertEquals("INCREASE", result.get("action"));
        assertEquals(55000.0, (Double) result.get("newSalary"), 0.01);
        verify(driverRepository, times(1)).save(mockDriver);
    }

    @Test
    void testEvaluateSalary_Decrease() {
        // Arrange
        mockDriver.setAverageScore(4.0); // Poor safety score
        Delivery lowRatingDelivery = Delivery.builder().userRating(2.0).build();
        when(driverRepository.findById(1L)).thenReturn(Optional.of(mockDriver));
        when(deliveryRepository.findByVehicleId(1L)).thenReturn(List.of(lowRatingDelivery));

        // Act
        Map<String, Object> result = performanceService.evaluateSalary(1L);

        // Assert
        assertEquals("DECREASE", result.get("action"));
        assertEquals(47500.0, (Double) result.get("newSalary"), 0.01);
    }

    @Test
    void testEvaluateSalary_Maintain() {
        // Arrange
        mockDriver.setAverageScore(7.5);
        Delivery midRatingDelivery = Delivery.builder().userRating(4.0).build();
        when(driverRepository.findById(1L)).thenReturn(Optional.of(mockDriver));
        when(deliveryRepository.findByVehicleId(1L)).thenReturn(List.of(midRatingDelivery));

        // Act
        Map<String, Object> result = performanceService.evaluateSalary(1L);

        // Assert
        assertEquals("MAINTAIN", result.get("action"));
        assertEquals(50000.0, (Double) result.get("newSalary"), 0.01);
    }
}
