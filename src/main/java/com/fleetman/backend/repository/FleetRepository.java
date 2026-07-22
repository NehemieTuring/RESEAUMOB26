package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FleetRepository extends JpaRepository<FleetEntity, UUID> {
    List<FleetEntity> findByManagerId(UUID managerId);
    @Query("SELECT f FROM FleetEntity f WHERE f.managerId IN (SELECT u.id FROM UserEntity u WHERE u.organizationId = :orgId)")
    List<FleetEntity> findAllByOrganizationId(@Param("orgId") UUID orgId);
}
