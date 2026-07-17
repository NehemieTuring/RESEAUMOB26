package com.fleetman.backend.repository;

import com.fleetman.backend.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface TripRepository extends JpaRepository<TripEntity, UUID> {
    List<TripEntity> findByFleetId(UUID fleetId);
    List<TripEntity> findByVehicleId(UUID vehicleId);
    List<TripEntity> findByDriverId(UUID driverId);
    List<TripEntity> findByDriverIdAndStatus(UUID driverId, String status);
    Optional<TripEntity> findByTripCode(String tripCode);
    long countByTripCodeStartingWith(String prefix);
}
