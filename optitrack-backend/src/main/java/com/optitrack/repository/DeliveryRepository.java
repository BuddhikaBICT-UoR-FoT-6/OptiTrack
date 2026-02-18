package com.optitrack.repository;

import com.optitrack.model.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findByVehicleId(Long vehicleId);
    List<Delivery> findByIsDelivered(Boolean isDelivered);
}
