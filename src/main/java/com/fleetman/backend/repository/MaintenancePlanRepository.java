package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface MaintenancePlanRepository extends JpaRepository<MaintenancePlanEntity, UUID> {
    List<MaintenancePlanEntity> findByFleetId(UUID fleetId);
    List<MaintenancePlanEntity> findByVehicleId(UUID vehicleId);
    List<MaintenancePlanEntity> findByManagerId(UUID managerId);
}
