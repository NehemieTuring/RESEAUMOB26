package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, UUID> {
    List<TripEntity> findByFleetId(UUID fleetId);
    List<TripEntity> findByCreatedBy(UUID createdBy);
    List<TripEntity> findByVehicleId(UUID vehicleId);
    List<TripEntity> findByDriverId(UUID driverId);
    List<TripEntity> findByDriverIdAndStatus(UUID driverId, String status);
    
    @Query("SELECT t FROM TripEntity t WHERE t.createdBy = :managerId OR t.vehicleId IN (SELECT v.id FROM VehicleEntity v WHERE v.managerId = :managerId)")
    List<TripEntity> findAllByManagerId(@Param("managerId") UUID managerId);
    
    @Query("SELECT t FROM TripEntity t WHERE t.createdBy IN (SELECT u.id FROM UserEntity u WHERE u.organizationId = :orgId) OR t.vehicleId IN (SELECT v.id FROM VehicleEntity v WHERE v.managerId IN (SELECT u2.id FROM UserEntity u2 WHERE u2.organizationId = :orgId))")
    List<TripEntity> findAllByOrganizationId(@Param("orgId") UUID orgId);

    Optional<TripEntity> findByTripCode(String tripCode);
    long countByTripCodeStartingWith(String prefix);
}
