package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface DriverRepository extends JpaRepository<DriverEntity, UUID> {
    List<DriverEntity> findByFleetId(UUID fleetId);
    List<DriverEntity> findByFleetIdIn(List<UUID> fleetIds);
    @Query("SELECT d FROM DriverEntity d WHERE d.managerId = :managerId AND (d.deleted = false OR d.deleted IS NULL)")
    List<DriverEntity> findByManagerIdAndDeletedFalseOrNull(@Param("managerId") UUID managerId);
    @Query("SELECT d FROM DriverEntity d WHERE d.userId IN (SELECT u.id FROM UserEntity u WHERE u.organizationId = :orgId) AND (d.deleted = false OR d.deleted IS NULL)")
    List<DriverEntity> findAllByOrganizationIdAndDeletedFalse(@Param("orgId") UUID orgId);
    Optional<DriverEntity> findByLicenceNumber(String licenceNumber);
    boolean existsByLicenceNumber(String licenceNumber);
    Optional<DriverEntity> findByAssignedVehicleId(UUID vehicleId);
}
