package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface GeofenceEventRepository extends JpaRepository<GeofenceEventEntity, UUID> {
    List<GeofenceEventEntity> findByVehicleId(UUID vehicleId);
    List<GeofenceEventEntity> findByZoneId(UUID zoneId);
}
