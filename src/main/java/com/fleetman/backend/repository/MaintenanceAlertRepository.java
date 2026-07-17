package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface MaintenanceAlertRepository extends JpaRepository<MaintenanceAlertEntity, UUID> {
    List<MaintenanceAlertEntity> findByFleetId(UUID fleetId);
    List<MaintenanceAlertEntity> findByVehicleId(UUID vehicleId);
    List<MaintenanceAlertEntity> findByManagerId(UUID managerId);
}
