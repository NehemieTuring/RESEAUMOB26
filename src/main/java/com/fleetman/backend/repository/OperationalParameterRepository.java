package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface OperationalParameterRepository extends JpaRepository<OperationalParameterEntity, UUID> {
    Optional<OperationalParameterEntity> findByVehicleId(UUID vehicleId);
}
