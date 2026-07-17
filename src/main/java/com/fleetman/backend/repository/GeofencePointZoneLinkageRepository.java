package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface GeofencePointZoneLinkageRepository extends JpaRepository<GeofencePointZoneLinkageEntity, GeofencePointZoneLinkageEntity.LinkageId> {
    List<GeofencePointZoneLinkageEntity> findByZoneIdOrderByVertexOrder(UUID zoneId);
    void deleteByZoneId(UUID zoneId);
}
