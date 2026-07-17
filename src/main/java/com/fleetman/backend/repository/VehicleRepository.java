package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface VehicleRepository extends JpaRepository<VehicleEntity, UUID> {
    List<VehicleEntity> findByManagerIdAndDeletedFalse(UUID managerId);
    List<VehicleEntity> findByDeletedFalse();
    List<VehicleEntity> findByFleetId(UUID fleetId);
    List<VehicleEntity> findByFleetIdAndDeletedFalse(UUID fleetId);
    Optional<VehicleEntity> findByLicensePlate(String licensePlate);
    boolean existsByLicensePlate(String licensePlate);
    long countByManagerIdAndDeletedFalse(UUID managerId);
    long countByFleetIdAndDeletedFalse(UUID fleetId);
}
