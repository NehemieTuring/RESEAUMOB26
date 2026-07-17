package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.*;

@Repository
public interface DriverScoreRepository extends JpaRepository<DriverScoreEntity, UUID> {
    List<DriverScoreEntity> findByDriverId(UUID driverId);
    List<DriverScoreEntity> findByFleetId(UUID fleetId);
    Optional<DriverScoreEntity> findByDriverIdAndPeriodTypeAndPeriodStart(UUID driverId, String periodType, LocalDate periodStart);
}
