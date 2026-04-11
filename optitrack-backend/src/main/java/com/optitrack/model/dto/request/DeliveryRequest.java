package com.optitrack.model.dto.request;

import com.optitrack.model.enums.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO for creating or requesting a delivery.
 * Restricts input to only user-controlled fields.
 */
@Data
public class DeliveryRequest {

    @NotBlank(message = "Package name is required")
    private String packageName;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Priority is required")
    private Priority priority;

    private String deliveryType;

    private Double destinationLat;
    private Double destinationLon;

    private Double advancePayment = 0.0;
    private Double totalPayment = 0.0;

    private VehicleRef vehicle;
    private CustomerRef customer;

    @Data
    public static class VehicleRef {
        private Long id;
    }

    @Data
    public static class CustomerRef {
        private Long id;
    }
}
