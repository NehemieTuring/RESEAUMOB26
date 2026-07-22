package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface GeofenceZoneRepository extends JpaRepository<GeofenceZoneEntity, UUID> {
    List<GeofenceZoneEntity> findByManagerIdAndDeletedFalse(UUID managerId);
    
    @Query("SELECT g FROM GeofenceZoneEntity g WHERE g.managerId IN (SELECT u.id FROM UserEntity u WHERE u.organizationId = :orgId) AND g.deleted = false")
    List<GeofenceZoneEntity> findAllByOrganizationIdAndDeletedFalse(@Param("orgId") UUID orgId);

    List<GeofenceZoneEntity> findByFleetIdAndDeletedFalse(UUID fleetId);
    List<GeofenceZoneEntity> findByDeletedFalse();
    List<GeofenceZoneEntity> findByZoneTypeAndDeletedFalse(String zoneType);
}
