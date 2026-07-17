package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface VehicleIllustrationImageRepository extends JpaRepository<VehicleIllustrationImageEntity, UUID> {
    List<VehicleIllustrationImageEntity> findByVehicleId(UUID vehicleId);
    void deleteByVehicleId(UUID vehicleId);
}
