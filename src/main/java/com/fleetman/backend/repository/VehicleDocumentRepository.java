package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface VehicleDocumentRepository extends JpaRepository<VehicleDocumentEntity, UUID> {
    List<VehicleDocumentEntity> findByVehicleIdAndDeletedFalse(UUID vehicleId);
    List<VehicleDocumentEntity> findByDeletedFalse();
}
