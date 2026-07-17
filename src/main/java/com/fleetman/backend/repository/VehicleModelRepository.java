package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModelEntity, UUID> {
    Optional<VehicleModelEntity> findByCode(String code);
}
