package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface IncidentRepository extends JpaRepository<IncidentEntity, UUID> {
    List<IncidentEntity> findByVehicleIdAndDeletedFalse(UUID vehicleId);
    List<IncidentEntity> findByManagerIdAndDeletedFalse(UUID managerId);
    
    @Query("SELECT i FROM IncidentEntity i WHERE (i.managerId = :managerId OR i.vehicleId IN (SELECT v.id FROM VehicleEntity v WHERE v.managerId = :managerId)) AND i.deleted = false")
    List<IncidentEntity> findAllByManagerIdAndDeletedFalse(@Param("managerId") UUID managerId);
    
    @Query("SELECT i FROM IncidentEntity i WHERE i.managerId IN (SELECT u.id FROM UserEntity u WHERE u.organizationId = :orgId) AND i.deleted = false")
    List<IncidentEntity> findAllByOrganizationIdAndDeletedFalse(@Param("orgId") UUID orgId);
    
    List<IncidentEntity> findByDeletedFalse();
}
