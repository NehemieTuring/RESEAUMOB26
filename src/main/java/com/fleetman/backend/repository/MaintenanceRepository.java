package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface MaintenanceRepository extends JpaRepository<MaintenanceEntity, UUID> {
    List<MaintenanceEntity> findByVehicleIdAndDeletedFalse(UUID vehicleId);
    List<MaintenanceEntity> findByDeletedFalse();
}
