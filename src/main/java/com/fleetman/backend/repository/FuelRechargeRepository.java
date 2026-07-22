package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface FuelRechargeRepository extends JpaRepository<FuelRechargeEntity, UUID> {
    List<FuelRechargeEntity> findByVehicleIdAndDeletedFalse(UUID vehicleId);
    List<FuelRechargeEntity> findByManagerIdAndDeletedFalse(UUID managerId);
    List<FuelRechargeEntity> findByDeletedFalse();
}
